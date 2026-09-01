#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const dataPath = path.join(rootDir, 'university-plans-extra.js');
const htmlPath = path.join(rootDir, 'index.html');

const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), context, {
  filename: dataPath,
  timeout: 10_000,
});

const plans = context.window.TU_EXTRA_UNIVERSITY_PLANS;
const meta = context.window.TU_EXTRA_UNIVERSITY_PLAN_META;
const errors = [];
const warnings = [];
const expected = {
  uqu: {name: 'جامعة أم القرى', domain: 'uqu.edu.sa', programmes: 155, colleges: 26},
  kau: {name: 'جامعة الملك عبدالعزيز', domain: 'kau.edu.sa', programmes: 107, colleges: 23},
};

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function value(value) {
  return String(value ?? '').trim();
}

function validateUniversity(id) {
  const definition = expected[id];
  const colleges = plans?.[id];
  if (!Array.isArray(colleges)) {
    fail(`${definition.name}: university data is missing`);
    return null;
  }
  if (colleges.length !== definition.colleges) {
    fail(`${definition.name}: expected ${definition.colleges} colleges, found ${colleges.length}`);
  }

  const collegeNames = new Set();
  const programmeIds = new Set();
  const programmeLabels = new Set();
  const globalCourseIds = new Set();
  let programmeCount = 0;
  let levelCount = 0;
  let courseCount = 0;
  let zeroCreditCourses = 0;

  for (const college of colleges) {
    const collegeName = value(college?.college);
    if (!collegeName) fail(`${definition.name}: college without a name`);
    if (collegeNames.has(collegeName)) fail(`${definition.name}: duplicate college ${collegeName}`);
    collegeNames.add(collegeName);
    if (!Array.isArray(college?.entries) || !college.entries.length) {
      fail(`${definition.name}: ${collegeName || 'unnamed college'} has no programmes`);
      continue;
    }

    for (const programme of college.entries) {
      programmeCount += 1;
      const prefix = `${definition.name} / ${collegeName} / ${value(programme?.name) || 'unnamed programme'}`;
      const programmeId = value(programme?.id);
      const programmeName = value(programme?.name);
      const labelKey = `${collegeName}\u0000${programmeName}`;
      if (!programmeId) fail(`${prefix}: missing programme id`);
      if (programmeIds.has(programmeId)) fail(`${prefix}: duplicate programme id ${programmeId}`);
      programmeIds.add(programmeId);
      if (!programmeName) fail(`${prefix}: missing programme name`);
      if (programmeLabels.has(labelKey)) fail(`${prefix}: duplicate programme label in the same college`);
      programmeLabels.add(labelKey);
      if (programme.university !== id) fail(`${prefix}: incorrect university id`);
      if (programme.college !== collegeName) fail(`${prefix}: college/group mismatch`);
      if (programme.degree !== 'بكالوريوس') fail(`${prefix}: degree must be bachelor`);
      if (programme.fullStudyDuration !== true) fail(`${prefix}: full-study-duration flag is missing`);
      if (programme.preparatoryIncluded !== true) fail(`${prefix}: preparatory/foundation inclusion flag is missing`);
      if (!(Number(programme.durationYears) > 0)) fail(`${prefix}: invalid duration`);
      try {
        const source = new URL(programme.source);
        if (source.protocol !== 'https:' || source.hostname !== definition.domain) {
          fail(`${prefix}: source is not on the official ${definition.domain} domain`);
        }
      } catch {
        fail(`${prefix}: invalid official source URL`);
      }

      if (!Array.isArray(programme.levels) || !programme.levels.length) {
        fail(`${prefix}: no academic levels`);
        continue;
      }
      let summedHours = 0;
      for (let levelIndex = 0; levelIndex < programme.levels.length; levelIndex += 1) {
        const level = programme.levels[levelIndex];
        levelCount += 1;
        const expectedLevel = levelIndex + 1;
        if (level.level !== expectedLevel) fail(`${prefix}: level sequence breaks at ${expectedLevel}`);
        if (!Array.isArray(level.courses) || !level.courses.length) {
          fail(`${prefix}: level ${expectedLevel} has no courses`);
          continue;
        }
        const levelCourseIds = new Set();
        for (const course of level.courses) {
          courseCount += 1;
          const courseId = value(course?.id);
          const courseCode = value(course?.code);
          const courseName = value(course?.name);
          const hours = Number(course?.hrs);
          if (!courseId) fail(`${prefix}: course without id in level ${expectedLevel}`);
          if (levelCourseIds.has(courseId)) fail(`${prefix}: repeated course id ${courseId} in one level`);
          levelCourseIds.add(courseId);
          if (globalCourseIds.has(courseId)) fail(`${prefix}: globally repeated course id ${courseId}`);
          globalCourseIds.add(courseId);
          if (!courseCode) fail(`${prefix}: course without code in level ${expectedLevel}`);
          if (!courseName) fail(`${prefix}: course without name in level ${expectedLevel}`);
          if (!Number.isFinite(hours) || hours < 0 || hours > 30) {
            fail(`${prefix}: invalid hours for ${courseCode || courseName}`);
          } else {
            summedHours += hours;
            if (hours === 0) zeroCreditCourses += 1;
          }
        }
      }
      if (summedHours !== programme.planHours) {
        fail(`${prefix}: plan-hours field does not equal the visible level sum (${summedHours})`);
      }
      if (id === 'uqu') {
        if (Number.isFinite(programme.catalogueHours) && programme.totalHours !== programme.catalogueHours) {
          fail(`${prefix}: total-hours field does not equal the official catalogue total`);
        }
        if (programme.visibleLevelHours !== summedHours) {
          fail(`${prefix}: visible-level-hours field does not equal the level sum`);
        }
        if (programme.hoursVariance !== programme.totalHours - summedHours) {
          fail(`${prefix}: official/visible hours variance is incorrect`);
        }
      } else if (summedHours !== programme.totalHours) {
        fail(`${prefix}: total-hours field does not equal the level sum (${summedHours})`);
      }
    }
  }

  if (programmeCount !== definition.programmes) {
    fail(`${definition.name}: expected ${definition.programmes} programmes, found ${programmeCount}`);
  }
  const recorded = meta?.stats?.[id];
  for (const [key, actual] of Object.entries({
    colleges: colleges.length,
    programmes: programmeCount,
    levels: levelCount,
    courses: courseCount,
  })) {
    if (recorded?.[key] !== actual) fail(`${definition.name}: metadata ${key} does not match data`);
  }
  return {colleges: colleges.length, programmes: programmeCount, levels: levelCount, courses: courseCount, zeroCreditCourses};
}

if (!plans || typeof plans !== 'object') fail('TU_EXTRA_UNIVERSITY_PLANS was not exported');
if (meta?.unavailableOfficialPages?.length) {
  fail(`official catalogue pages omitted: ${meta.unavailableOfficialPages.length}`);
}

const result = {
  uqu: validateUniversity('uqu'),
  kau: validateUniversity('kau'),
};

const html = fs.readFileSync(htmlPath, 'utf8');
const requiredHtmlMarkers = [
  'src="university-plans-extra.js?v=2026.09.01"',
  'id="uni-card-uqu"',
  'id="uni-card-kau"',
  "uqu:{name:'جامعة أم القرى'",
  "kau:{name:'جامعة الملك عبدالعزيز'",
  'const UQU_SPECS=',
  'const KAU_SPECS=',
  '["uqu", "جامعة أم القرى"]',
  '["kau", "جامعة الملك عبدالعزيز"]',
];
for (const marker of requiredHtmlMarkers) {
  if (!html.includes(marker)) fail(`index.html integration marker missing: ${marker}`);
}

console.log(JSON.stringify({result, warnings: warnings.length, errors: errors.length}, null, 2));
if (warnings.length) {
  console.log(`\nOfficial catalogue/visible-level total differences: ${warnings.length}`);
  console.log(warnings.slice(0, 12).map(item => `- ${item}`).join('\n'));
  if (warnings.length > 12) console.log(`- … ${warnings.length - 12} more`);
}
if (errors.length) {
  console.error(`\nValidation failed with ${errors.length} error(s):`);
  console.error(errors.slice(0, 80).map(item => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log('\nValidation passed: no structural errors.');
