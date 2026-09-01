#!/usr/bin/env python3
"""Build UQU and KAU bachelor study-plan data from their official catalogues.

The generated browser file is intentionally deterministic: volatile timestamps are
kept in a separate metadata object and the universities/colleges/programmes are
sorted by their Arabic labels before serialization.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from lxml import html


USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0 Safari/537.36 "
    "TaibahAcademicPlanSync/1.0"
)
UQU_CATALOGUE = "https://uqu.edu.sa/App/Degrees"
KAU_CATALOGUE = "https://kau.edu.sa/ar/programs"
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


@dataclass(frozen=True)
class CatalogueItem:
    university: str
    url: str
    remote_id: str
    listed_college: str = ""
    listed_hours: int | None = None


class Fetcher:
    def __init__(self, cache_dir: Path, refresh: bool = False) -> None:
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.refresh = refresh

    def _cache_path(self, url: str) -> Path:
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
        return self.cache_dir / f"{digest}.html"

    def get(self, url: str) -> str:
        cached = self._cache_path(url)
        if cached.exists() and not self.refresh:
            return cached.read_text(encoding="utf-8")

        last_error: Exception | None = None
        for attempt in range(5):
            try:
                req = urllib.request.Request(
                    url,
                    headers={
                        "User-Agent": USER_AGENT,
                        "Accept-Language": "ar-SA,ar;q=0.9,en;q=0.6",
                    },
                )
                with urllib.request.urlopen(req, timeout=45) as response:
                    body = response.read().decode("utf-8", "replace")
                cached.write_text(body, encoding="utf-8")
                return body
            except (OSError, TimeoutError, urllib.error.URLError) as exc:
                last_error = exc
                time.sleep(min(8, 1.25 * (2**attempt)))
        raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def text(value: Any) -> str:
    cleaned = " ".join(str(value or "").replace("\xa0", " ").split())
    if "Ø" in cleaned or "Ù" in cleaned:
        try:
            cleaned = cleaned.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
    return unicodedata.normalize("NFC", cleaned)


def integer(value: Any) -> int | None:
    match = re.search(r"\d+", text(value).translate(ARABIC_DIGITS))
    return int(match.group()) if match else None


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = re.sub(r"[^0-9A-Za-z\u0600-\u06ff]+", "_", value).strip("_")
    return value.lower()[:64] or "programme"


def prefixed_college(value: str, *, uqu: bool = False) -> str:
    value = text(value).strip(" -/")
    value = value.replace("الإقتصاد", "الاقتصاد")
    if not value:
        return "البرامج الأكاديمية"
    if value.startswith(("كلية ", "الكلية ", "معهد ", "عمادة ", "السنة ")):
        return value
    if uqu and value == "الطب":
        return "كلية الطب"
    return f"كلية {value}"


def uqu_catalogue_items(fetcher: Fetcher) -> list[CatalogueItem]:
    urls = [f"{UQU_CATALOGUE}?perPage=100&page={page}" for page in range(1, 5)]
    pages = fetch_many(fetcher, urls, workers=4)
    found: dict[str, CatalogueItem] = {}
    for url in urls:
        root = html.fromstring(pages[url])
        for row in root.xpath("//table//tr"):
            links = row.xpath('.//a[contains(@href,"/App/Degrees/")]/@href')
            cells = [text(cell.text_content()) for cell in row.xpath("./th|./td")]
            if not links or len(cells) < 4 or text(cells[1]) != "بكالوريوس":
                continue
            programme_url = links[0]
            remote_id = programme_url.rstrip("/").rsplit("/", 1)[-1]
            college = text(cells[2]).split("/", 1)[0].strip()
            found[remote_id] = CatalogueItem(
                university="uqu",
                url=programme_url,
                remote_id=remote_id,
                listed_college=prefixed_college(college, uqu=True),
                listed_hours=integer(cells[3]),
            )
    return sorted(found.values(), key=lambda item: int(item.remote_id))


def kau_catalogue_items(fetcher: Fetcher) -> list[CatalogueItem]:
    urls = [f"{KAU_CATALOGUE}?page={page}" for page in range(1, 21)]
    pages = fetch_many(fetcher, urls, workers=6)
    found: dict[str, CatalogueItem] = {}
    for url in urls:
        root = html.fromstring(pages[url])
        for card in root.xpath("//article"):
            card_text = text(card.text_content())
            links = card.xpath('.//a[contains(@href,"/programs/")]/@href')
            if not links or not card_text.startswith("Bachelor"):
                continue
            path = links[-1]
            full_url = path if path.startswith("http") else f"https://kau.edu.sa{path}"
            remote_id = path.rstrip("/").rsplit("/", 1)[-1]
            found[remote_id] = CatalogueItem(
                university="kau", url=full_url, remote_id=remote_id
            )
    return sorted(found.values(), key=lambda item: item.remote_id)


def fetch_many(
    fetcher: Fetcher, urls: Iterable[str], *, workers: int
) -> dict[str, str]:
    ordered = list(dict.fromkeys(urls))
    result: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        pending = {pool.submit(fetcher.get, url): url for url in ordered}
        for future in as_completed(pending):
            url = pending[future]
            result[url] = future.result()
    return result


def parse_hours_label(label: str) -> int:
    label = text(label).translate(ARABIC_DIGITS)
    number = integer(label)
    if number is not None:
        return number
    if "لا توجد" in label:
        return 0
    if "ساعة واحدة" in label or label == "ساعة":
        return 1
    if "ساعتين" in label:
        return 2
    raise ValueError(f"Unrecognised credit-hours label: {label!r}")


def uqu_metadata(root: Any, fallback: CatalogueItem) -> tuple[str, str, str]:
    title_nodes = root.xpath('//h1[contains(@class,"text-primary-800")]')
    if not title_nodes:
        title_nodes = root.xpath("//h1[normalize-space(.)]")
    title = text(title_nodes[-1].text_content()) if title_nodes else f"برنامج {fallback.remote_id}"

    college = fallback.listed_college
    department = ""
    metadata = root.xpath('//p[contains(normalize-space(.),"الكلية:")]')
    if metadata:
        metadata_text = text(metadata[0].getparent().text_content())
        college_match = re.search(r"الكلية:\s*(.+)$", metadata_text)
        department_match = re.search(r"القسم:\s*(.*?)\s+الكلية:", metadata_text)
        if college_match:
            college = prefixed_college(college_match.group(1), uqu=True)
        if department_match:
            department = text(department_match.group(1))
    return title, college, department


def parse_uqu_program(item: CatalogueItem, source: str) -> dict[str, Any]:
    root = html.fromstring(source)
    name, college, department = uqu_metadata(root, item)
    levels: list[dict[str, Any]] = []

    level_nodes = root.xpath('//h3[starts-with(normalize-space(.),"المستوى")]')
    for fallback_level, heading in enumerate(level_nodes, start=1):
        level_number = integer(heading.text_content()) or fallback_level
        containers = heading.getparent().xpath("./div[1]")
        courses: list[dict[str, Any]] = []
        if containers:
            for position, card in enumerate(containers[0].xpath("./div"), start=1):
                codes = card.xpath(
                    './/span[contains(@class,"text-gray-600") and contains(@class,"text-xs")]'
                )
                names = card.xpath('.//span[contains(@class,"text-primary-800")]')
                hour_labels = card.xpath(
                    './/span[contains(@class,"text-gray-600") and contains(@class,"text-sm")]'
                )
                if not names:
                    continue
                code = text(codes[0].text_content()) if codes else f"UQU-{item.remote_id}-{level_number}-{position}"
                course_name = text(names[0].text_content())
                hours = parse_hours_label(hour_labels[0].text_content()) if hour_labels else 0
                course_href = card.xpath('.//a[contains(@href,"/App/Degrees/")]/@href')
                courses.append(
                    {
                        "id": f"uqu_{item.remote_id}_l{level_number}_{position}",
                        "code": code,
                        "name": course_name,
                        "hrs": hours,
                        "source": course_href[0] if course_href else item.url,
                    }
                )
        if courses:
            levels.append({"level": level_number, "courses": courses})

    if not levels:
        raise ValueError("official page does not expose a level-by-level plan")

    recommendation_nodes = root.xpath(
        '//span[contains(normalize-space(.),"التوصية:")]'
    )
    recommendation = (
        text(recommendation_nodes[0].text_content()) if recommendation_nodes else ""
    )
    total_hours = sum(
        course["hrs"] for level in levels for course in level["courses"]
    )
    duration_years = round(len(levels) / 2, 1)
    listed_hours = item.listed_hours
    official_hours = listed_hours if listed_hours is not None else total_hours
    return {
        "id": f"uqu_{item.remote_id}_{slug(name)}",
        "name": name,
        "icon": "◆",
        "university": "uqu",
        "degree": "بكالوريوس",
        "college": college,
        "department": department,
        "source": item.url,
        "sourceType": "الفهرس الأكاديمي الرسمي لجامعة أم القرى",
        "recommendation": recommendation,
        "levels": levels,
        "totalHours": official_hours,
        "catalogueHours": listed_hours,
        "planHours": total_hours,
        "visibleLevelHours": total_hours,
        "hoursVariance": official_hours - total_hours,
        "programType": "بكالوريوس",
        "durationYears": duration_years,
        "fullStudyDuration": True,
        "preparatoryIncluded": True,
        "about": (
            f"الخطة الرسمية الكاملة المنشورة لبرنامج {name} في جامعة أم القرى؛ "
            f"من المستوى الأول حتى المستوى {levels[-1]['level']}. "
            f"إجمالي الفهرس الرسمي {official_hours} ساعة، وتفاصيل المستويات المنشورة تجمع {total_hours} ساعة."
        ),
    }


def decode_next_payloads(root: Any) -> Iterable[str]:
    prefix = "self.__next_f.push("
    for script in root.xpath("//script[not(@src)]"):
        body = script.text or ""
        if not body.startswith(prefix) or not body.endswith(")"):
            continue
        try:
            value = json.loads(body[len(prefix) : -1])
        except json.JSONDecodeError:
            continue
        if len(value) > 1 and isinstance(value[1], str):
            yield value[1]


def decode_json_property(payload: str, key: str) -> Any | None:
    marker = json.dumps(key) + ":"
    position = payload.find(marker)
    if position < 0:
        return None
    try:
        return json.JSONDecoder().raw_decode(payload, position + len(marker))[0]
    except json.JSONDecodeError:
        return None


def kau_value_after_label(root: Any, label: str) -> str:
    nodes = root.xpath('//p[normalize-space(.)=$label]', label=label)
    if not nodes:
        return ""
    parent = nodes[0].getparent()
    children = list(parent)
    try:
        index = children.index(nodes[0])
    except ValueError:
        return ""
    return text(children[index + 1].text_content()) if index + 1 < len(children) else ""


def kau_duration_years(label: str, levels_count: int) -> float:
    label = text(label).translate(ARABIC_DIGITS).lower()
    number = integer(label)
    if number:
        return float(number)
    words = {"four": 4, "five": 5, "six": 6, "seven": 7}
    for word, value in words.items():
        if word in label:
            return float(value)
    return round(levels_count / 2, 1)


def flatten_kau_levels(levels: list[dict[str, Any]]) -> list[dict[str, Any]]:
    flattened: list[dict[str, Any]] = []

    def visit(nodes: list[dict[str, Any]]) -> None:
        for node in nodes:
            courses = node.get("courses") or []
            if courses:
                flattened.append(node)
            children = node.get("children") or []
            if children:
                visit(children)

    visit(levels)
    return flattened


def parse_kau_program(item: CatalogueItem, source: str) -> dict[str, Any]:
    root = html.fromstring(source)
    title_nodes = root.xpath("//h1[normalize-space(.)]")
    name = text(title_nodes[-1].text_content()) if title_nodes else item.remote_id
    college = prefixed_college(kau_value_after_label(root, "الكلية"))
    department = kau_value_after_label(root, "القسم")
    language = kau_value_after_label(root, "اللغة")
    duration_label = kau_value_after_label(root, "المدة")

    study_plans: list[dict[str, Any]] | None = None
    for payload in decode_next_payloads(root):
        candidate = decode_json_property(payload, "studyPlan")
        if isinstance(candidate, list):
            study_plans = candidate
            break
    if not study_plans:
        raise ValueError("official page does not expose study-plan data")

    sections = [
        section
        for section in study_plans
        if section.get("has_levels") and section.get("levels")
    ]
    preferred = [section for section in sections if "المستويات" in text(section.get("name"))]
    if preferred:
        section = max(preferred, key=lambda value: len(value.get("levels") or []))
    elif sections:
        section = max(
            sections,
            key=lambda value: sum(
                len(level.get("courses") or []) for level in value.get("levels") or []
            ),
        )
    else:
        raise ValueError("official study plan has no semester levels")

    raw_levels = flatten_kau_levels(section.get("levels") or [])
    levels: list[dict[str, Any]] = []
    for level_number, raw_level in enumerate(raw_levels, start=1):
        courses: list[dict[str, Any]] = []
        for position, item_course in enumerate(raw_level.get("courses") or [], start=1):
            course = item_course.get("course") or {}
            code = text(item_course.get("course_code") or course.get("course_code"))
            course_name = text(course.get("name_ar") or course.get("name_en"))
            hours = item_course.get("credit_hours")
            if hours is None:
                hours = course.get("credit_hours")
            if not code or not course_name or hours is None:
                continue
            courses.append(
                {
                    "id": f"kau_{slug(item.remote_id)}_l{level_number}_{position}",
                    "code": code,
                    "name": course_name,
                    "hrs": int(hours),
                    "prerequisites": text(course.get("prerequisites")),
                }
            )
        if courses:
            levels.append({"level": level_number, "courses": courses})

    if not levels:
        raise ValueError("official level plan has no usable courses")

    total_hours = sum(
        course["hrs"] for level in levels for course in level["courses"]
    )
    duration_years = kau_duration_years(duration_label, len(levels))
    return {
        "id": f"kau_{slug(item.remote_id)}",
        "name": name,
        "icon": "◆",
        "university": "kau",
        "degree": "بكالوريوس",
        "college": college,
        "department": department,
        "language": language,
        "source": item.url,
        "sourceType": "دليل البرامج الأكاديمية الرسمي لجامعة الملك عبدالعزيز",
        "levels": levels,
        "totalHours": total_hours,
        "planHours": total_hours,
        "programType": "بكالوريوس",
        "durationYears": duration_years,
        "fullStudyDuration": True,
        "preparatoryIncluded": True,
        "about": (
            f"الخطة الرسمية الكاملة المنشورة لبرنامج {name} في جامعة الملك عبدالعزيز؛ "
            f"تشمل {len(levels)} مستويات بإجمالي {total_hours} ساعة، "
            "وتبدأ من المستوى الأول المنشور ضمن مدة البرنامج."
        ),
    }


def parse_programmes(
    fetcher: Fetcher, items: list[CatalogueItem], *, workers: int
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    pages = fetch_many(fetcher, (item.url for item in items), workers=workers)
    programmes: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    def parse_one(item: CatalogueItem) -> dict[str, Any]:
        source = pages[item.url]
        return (
            parse_uqu_program(item, source)
            if item.university == "uqu"
            else parse_kau_program(item, source)
        )

    with ThreadPoolExecutor(max_workers=workers) as pool:
        pending = {pool.submit(parse_one, item): item for item in items}
        for future in as_completed(pending):
            item = pending[future]
            try:
                programmes.append(future.result())
            except Exception as exc:  # Report every omitted official page.
                failures.append(
                    {"university": item.university, "url": item.url, "error": str(exc)}
                )
    programmes.sort(key=lambda programme: (programme["college"], programme["name"], programme["id"]))
    failures.sort(key=lambda failure: failure["url"])
    return programmes, failures


def group_by_college(programmes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for programme in programmes:
        grouped.setdefault(programme["college"], []).append(programme)
    return [
        {"college": college, "entries": sorted(entries, key=lambda entry: (entry["name"], entry["id"]))}
        for college, entries in sorted(grouped.items())
    ]


def stats(grouped: list[dict[str, Any]]) -> dict[str, int]:
    entries = [entry for college in grouped for entry in college["entries"]]
    return {
        "colleges": len(grouped),
        "programmes": len(entries),
        "levels": sum(len(entry["levels"]) for entry in entries),
        "courses": sum(
            len(level["courses"]) for entry in entries for level in entry["levels"]
        ),
    }


def write_javascript(
    output: Path,
    uqu: list[dict[str, Any]],
    kau: list[dict[str, Any]],
    failures: list[dict[str, str]],
) -> None:
    payload = {"uqu": group_by_college(uqu), "kau": group_by_college(kau)}
    metadata = {
        "schemaVersion": 1,
        "sources": {
            "uqu": UQU_CATALOGUE,
            "kau": KAU_CATALOGUE,
        },
        "stats": {key: stats(value) for key, value in payload.items()},
        "unavailableOfficialPages": failures,
    }
    encoded_payload = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    encoded_metadata = json.dumps(metadata, ensure_ascii=False, separators=(",", ":"))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "/* Generated from the official UQU and KAU academic catalogues. */\n"
        "(function(g){'use strict';"
        f"g.TU_EXTRA_UNIVERSITY_PLANS={encoded_payload};"
        f"g.TU_EXTRA_UNIVERSITY_PLAN_META={encoded_metadata};"
        "})(window);\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "university-plans-extra.js",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path("/tmp/taibah-academic-plan-cache"),
    )
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    fetcher = Fetcher(args.cache_dir, refresh=args.refresh)
    print("Discovering official bachelor programmes…", flush=True)
    uqu_items = uqu_catalogue_items(fetcher)
    kau_items = kau_catalogue_items(fetcher)
    print(f"UQU catalogue: {len(uqu_items)} bachelor pages", flush=True)
    print(f"KAU catalogue: {len(kau_items)} bachelor pages", flush=True)

    uqu, uqu_failures = parse_programmes(fetcher, uqu_items, workers=args.workers)
    print(f"UQU parsed: {len(uqu)}; unavailable: {len(uqu_failures)}", flush=True)
    kau, kau_failures = parse_programmes(fetcher, kau_items, workers=args.workers)
    print(f"KAU parsed: {len(kau)}; unavailable: {len(kau_failures)}", flush=True)

    failures = uqu_failures + kau_failures
    write_javascript(args.output, uqu, kau, failures)
    print(f"Wrote {args.output}", flush=True)
    print(json.dumps({"uqu": stats(group_by_college(uqu)), "kau": stats(group_by_college(kau))}, ensure_ascii=False, indent=2), flush=True)
    if failures:
        print("Official pages without usable level data:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure['url']}: {failure['error']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
