export const educationCategoryOptions = [
  {
    id: 'primary',
    label: 'School',
    courseType: 'Starting Education',
    uploadTitle: 'School education center upload',
    uploadDescription: 'Save starting education schools and beginner learning centers into the primary navigation section.'
  },
  {
    id: 'secondary',
    label: 'College',
    courseType: 'Higher Education',
    uploadTitle: 'College education center upload',
    uploadDescription: 'Save higher education centers and college-preparation programs into the secondary navigation section.'
  },
  {
    id: 'extra',
    label: 'Coaching Center',
    courseType: 'Additional Education',
    uploadTitle: 'Coaching center upload',
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
