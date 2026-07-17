export const educationCategoryCourseTypeMap = {
  primary: 'Starting Education',
  secondary: 'Higher Education',
  extra: 'Additional Education'
};

export const educationCategoryLevelMap = {
  primary: 'Primary',
  secondary: 'Secondary',
  extra: 'Extra Skills'
};

export const validEducationCategoryKeys = Object.keys(educationCategoryCourseTypeMap);

export function getCategoryKeyFromCourseType(courseType = '') {
  const normalizedCourseType = courseType.trim();

  return (
    validEducationCategoryKeys.find(
      (categoryKey) => educationCategoryCourseTypeMap[categoryKey] === normalizedCourseType
    ) || null
  );
}

export function normalizeEducationCategory(categoryKey, courseType) {
  const normalizedCategoryKey = categoryKey?.trim().toLowerCase();

  if (normalizedCategoryKey && validEducationCategoryKeys.includes(normalizedCategoryKey)) {
    return {
      categoryKey: normalizedCategoryKey,
      courseType: educationCategoryCourseTypeMap[normalizedCategoryKey],
      level: educationCategoryLevelMap[normalizedCategoryKey]
    };
  }

  const inferredCategoryKey = getCategoryKeyFromCourseType(courseType);

  if (!inferredCategoryKey) {
    return null;
  }

  return {
    categoryKey: inferredCategoryKey,
    courseType: educationCategoryCourseTypeMap[inferredCategoryKey],
    level: educationCategoryLevelMap[inferredCategoryKey]
  };
}
