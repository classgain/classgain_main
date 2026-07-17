export const educationCategoryOptions = [
  {
    id: 'primary',
    label: 'Starting Education',
    courseType: 'Starting Education',
    uploadTitle: 'Primary education center upload',
    uploadDescription: 'Save starting education schools and beginner learning centers into the primary navigation section.'
  },
  {
    id: 'secondary',
    label: 'Higher Education',
    courseType: 'Higher Education',
    uploadTitle: 'Secondary education center upload',
    uploadDescription: 'Save higher education centers and college-preparation programs into the secondary navigation section.'
  },
  {
    id: 'extra',
    label: 'Additional Education',
    courseType: 'Additional Education',
    uploadTitle: 'Extra skills center upload',
    uploadDescription: 'Save coaching centers, skill programs, and practical training centers into the extra skills navigation section.'
  }
];

const educationCategoryMap = Object.fromEntries(educationCategoryOptions.map((item) => [item.id, item]));

const courseTypeToCategoryKeyMap = Object.fromEntries(
  educationCategoryOptions.map((item) => [item.courseType, item.id])
);

export function getCourseTypeFromCategoryKey(categoryKey) {
  return educationCategoryMap[categoryKey]?.courseType ?? educationCategoryMap.primary.courseType;
}

export function getCategoryKeyFromCourseType(courseType) {
  return courseTypeToCategoryKeyMap[courseType] ?? 'primary';
}

export function getEducationCategoryByKey(categoryKey) {
  return educationCategoryMap[categoryKey] ?? educationCategoryMap.primary;
}
