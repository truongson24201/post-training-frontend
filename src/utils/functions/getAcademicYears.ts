export function getAcademicYears(yearsBefore: number) {
    const currentYear = new Date().getFullYear();
    const offset = 5;

    const academicYears = [];

    for (let startYear = currentYear - yearsBefore; startYear <= currentYear; startYear++) {
        const endYear = startYear + offset - 1;
        const academicYear = `${startYear}-${endYear}`;
        academicYears.push(academicYear);
    }

    return academicYears;
}