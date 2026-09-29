export const adminSummary = {
  totalStudents: 500,
  totalTeachers: 42,
  activeAssignments: 86,
  overloadedStudents: 37,
}

export const workloadDistribution = [
  { label: 'Low workload', value: 220, color: '#10906B', level: 'safe' },
  { label: 'Moderate workload', value: 243, color: '#C3820B', level: 'warn' },
  { label: 'High workload', value: 37, color: '#D14343', level: 'risk' },
]

export const assignmentsByDepartment = [
  { label: 'AI & Data Science', value: 31 },
  { label: 'Computer Science', value: 28 },
  { label: 'Information Technology', value: 17 },
  { label: 'Electronics & Comm.', value: 10 },
]

export const assignmentsBySubject = [
  { label: 'Machine Learning', value: 14 },
  { label: 'Database Management', value: 9 },
  { label: 'Java Programming', value: 8 },
  { label: 'Big Data Analytics', value: 7 },
  { label: 'Data Visualization', value: 6 },
  { label: 'Python Programming', value: 5 },
]

export const assignmentsByTeacher = [
  { label: 'Dr. Kumar', value: 21 },
  { label: 'Dr. Arun', value: 17 },
  { label: 'Prof. Priya', value: 14 },
  { label: 'Prof. Lakshmi', value: 11 },
  { label: 'Dr. Vignesh', value: 9 },
]

export const workloadTrend = [
  { label: 'Week 30', value: 52 },
  { label: 'Week 31', value: 57 },
  { label: 'Week 32', value: 55 },
  { label: 'Week 33', value: 63 },
  { label: 'Week 34', value: 61 },
  { label: 'Week 35', value: 70 },
  { label: 'Week 36', value: 68 },
  { label: 'Week 37', value: 74 },
]

export const deadlineCongestion = [
  { date: 'September 5', assignments: 7, level: 'moderate', departments: 3 },
  { date: 'September 10', assignments: 12, level: 'high', departments: 4 },
  { date: 'September 12', assignments: 5, level: 'moderate', departments: 2 },
  { date: 'September 15', assignments: 9, level: 'high', departments: 3 },
  { date: 'September 18', assignments: 3, level: 'low', departments: 2 },
  { date: 'September 22', assignments: 4, level: 'low', departments: 2 },
]

export const adminAssignments = [
  { id: 'aa-1', title: 'Machine Learning Classification Assignment', subject: 'Machine Learning', teacher: 'Dr. Kumar', department: 'AI & Data Science', deadline: 'Sep 4', students: 60, submitted: 42, status: 'Active' },
  { id: 'aa-2', title: 'Normalization & Indexing Lab', subject: 'Database Management Systems', teacher: 'Prof. Priya', department: 'Computer Science', deadline: 'Sep 7', students: 72, submitted: 30, status: 'Active' },
  { id: 'aa-3', title: 'Inheritance & Interfaces Worksheet', subject: 'Java Programming', teacher: 'Dr. Arun', department: 'Computer Science', deadline: 'Sep 9', students: 58, submitted: 11, status: 'Active' },
  { id: 'aa-4', title: 'Python List Comprehension Exercise', subject: 'Python Programming', teacher: 'Prof. Priya', department: 'AI & Data Science', deadline: 'Sep 10', students: 64, submitted: 5, status: 'Active' },
  { id: 'aa-5', title: 'Spark DataFrame Lab', subject: 'Big Data Analytics', teacher: 'Dr. Kumar', department: 'AI & Data Science', deadline: 'Sep 12', students: 58, submitted: 12, status: 'Active' },
  { id: 'aa-6', title: 'Dashboard Critique Report', subject: 'Data Visualization', teacher: 'Dr. Arun', department: 'AI & Data Science', deadline: 'Aug 29', students: 60, submitted: 60, status: 'Closed' },
  { id: 'aa-7', title: 'MapReduce Word Frequency', subject: 'Big Data Analytics', teacher: 'Dr. Kumar', department: 'AI & Data Science', deadline: 'Aug 31', students: 60, submitted: 55, status: 'Closed' },
]

export const adminAlerts = [
  { id: 'al-1', level: 'warn', title: '37 students currently have high workload', body: 'Highest concentration in AI & Data Science, Semester 5 Section A.', action: 'Review students' },
  { id: 'al-2', level: 'risk', title: 'Machine Learning has the highest assignment density this week', body: '14 active assignments across 3 sections, averaging 2.4 hours each.', action: 'View subject' },
  { id: 'al-3', level: 'info', title: 'September 10 shows deadline congestion', body: '12 assignments from 4 departments share the same due date.', action: 'Open analytics' },
]
