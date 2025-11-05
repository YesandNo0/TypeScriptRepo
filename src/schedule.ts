/* ---------- 1) Базові типи ---------- */

// a) Дні тижня
export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday";

// b) Часові слоти
export type TimeSlot =
    | "8:30-10:00"
    | "10:15-11:45"
    | "12:15-13:45"
    | "14:00-15:30"
    | "15:45-17:15";

// c) Тип занять
export type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

/* ---------- 2) Основні структури ---------- */

// a) Професор
export type Professor = {
  id: number;
  name: string;
  department: string;
};

// b) Аудиторія
export type Classroom = {
  number: string;
  capacity: number;
  hasProjector: boolean;
};

// c) Курс
export type Course = {
  id: number;
  name: string;
  type: CourseType;
};

// d) Заняття (БЕЗ id, вимога задачі)
// Примітка: lessonId у функціях — це індекс у масиві schedule.
export type Lesson = {
  courseId: number;
  professorId: number;
  classroomNumber: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
};

/* ---------- 3) Дані ---------- */

export const days: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const timeSlots: TimeSlot[] = [
  "8:30-10:00",
  "10:15-11:45",
  "12:15-13:45",
  "14:00-15:30",
  "15:45-17:15",
];

// БД у пам'яті
export const professors: Professor[] = [];
export const classrooms: Classroom[] = [];
export const courses: Course[] = [];
export const schedule: Lesson[] = [];

/* ---------- 4) Допоміжне ---------- */

// Повертає true, якщо два уроки йдуть одночасно в один і той же день
const sameSlot = (a: Lesson, b: Lesson): boolean =>
    a.dayOfWeek === b.dayOfWeek && a.timeSlot === b.timeSlot;

// Знайти курс/проф/аудиторію
const getCourseById = (id: number): Course | undefined =>
    courses.find((c) => c.id === id);

const getProfessorById = (id: number): Professor | undefined =>
    professors.find((p) => p.id === id);

const getClassroomByNumber = (num: string): Classroom | undefined =>
    classrooms.find((c) => c.number === num);

/* ---------- 5) Додавання ---------- */

export function addProfessor(professor: Professor): void {
  // Унікальність id
  if (professors.some((p) => p.id === professor.id)) {
    throw new Error(`Professor with id=${professor.id} already exists`);
  }
  professors.push(professor);
}

export function addClassroom(room: Classroom): void {
  if (classrooms.some((c) => c.number === room.number)) {
    throw new Error(`Classroom ${room.number} already exists`);
  }
  classrooms.push(room);
}

export function addCourse(course: Course): void {
  if (courses.some((c) => c.id === course.id)) {
    throw new Error(`Course with id=${course.id} already exists`);
  }
  courses.push(course);
}

/* ---------- 6) Конфлікти та валідація ---------- */

export type ScheduleConflictType = "ProfessorConflict" | "ClassroomConflict";

export type ScheduleConflict = {
  type: ScheduleConflictType;
  lessonDetails: Lesson; // урок з яким конфліктує новий
};

/** Перевіряє:
 *  - чи існують course/professor/classroom
 *  - чи не зайнятий професор у цей самий слот
 *  - чи не зайнята аудиторія у цей самий слот
 */
export function validateLesson(lesson: Lesson): ScheduleConflict | null {
  if (!getCourseById(lesson.courseId)) {
    throw new Error(`Course ${lesson.courseId} not found`);
  }
  if (!getProfessorById(lesson.professorId)) {
    throw new Error(`Professor ${lesson.professorId} not found`);
  }
  if (!getClassroomByNumber(lesson.classroomNumber)) {
    throw new Error(`Classroom ${lesson.classroomNumber} not found`);
  }

  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i];

    if (sameSlot(lesson, s) && s.professorId === lesson.professorId) {
      return { type: "ProfessorConflict", lessonDetails: s };
    }
    if (sameSlot(lesson, s) && s.classroomNumber === lesson.classroomNumber) {
      return { type: "ClassroomConflict", lessonDetails: s };
    }
  }
  return null;
}

/** Додає урок, якщо немає конфліктів. */
export function addLesson(lesson: Lesson): boolean {
  const conflict = validateLesson(lesson);
  if (conflict) return false;
  schedule.push(lesson);
  return true;
}

/* ---------- 7) Пошук/фільтри ---------- */

export function findAvailableClassrooms(
    timeSlot: TimeSlot,
    dayOfWeek: DayOfWeek
): string[] {
  // Аудиторії, що зайняті у цей час
  const busy = new Set<string>();
  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i];
    if (s.dayOfWeek === dayOfWeek && s.timeSlot === timeSlot) {
      busy.add(s.classroomNumber);
    }
  }
  // Вільні = усі - зайняті
  const result: string[] = [];
  for (let j = 0; j < classrooms.length; j++) {
    const num = classrooms[j].number;
    if (!busy.has(num)) result.push(num);
  }
  return result;
}

export function getProfessorSchedule(professorId: number): Lesson[] {
  const profExists = getProfessorById(professorId);
  if (!profExists) throw new Error(`Professor ${professorId} not found`);
  const out: Lesson[] = [];
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].professorId === professorId) out.push(schedule[i]);
  }
  return out;
}

/* ---------- 8) Звіти/аналітика ---------- */

/** Відсоток використання аудиторії за всі робочі дні і всі слоти.
 * Формула: (кількість зайнятих слотів у цій аудиторії / (days * timeSlots)) * 100
 */
export function getClassroomUtilization(classroomNumber: string): number {
  if (!getClassroomByNumber(classroomNumber)) {
    throw new Error(`Classroom ${classroomNumber} not found`);
  }
  let used = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].classroomNumber === classroomNumber) used++;
  }
  const total = days.length * timeSlots.length;
  return total === 0 ? 0 : Math.round((used / total) * 10000) / 100; // 2 знаки
}

/** Найпопулярніший тип занять за фактичними уроками у розкладі. */
export function getMostPopularCourseType(): CourseType {
  // Лічильники
  let lecture = 0;
  let seminar = 0;
  let lab = 0;
  let practice = 0;

  for (let i = 0; i < schedule.length; i++) {
    const lesson = schedule[i];
    const course = getCourseById(lesson.courseId);
    if (!course) continue;
    const t = course.type;
    if (t === "Lecture") lecture++;
    else if (t === "Seminar") seminar++;
    else if (t === "Lab") lab++;
    else practice++;
  }

  // Визначити максимум (стабільний порядок при рівності)
  let best: CourseType = "Lecture";
  let bestVal = lecture;

  if (seminar > bestVal) {
    best = "Seminar";
    bestVal = seminar;
  }
  if (lab > bestVal) {
    best = "Lab";
    bestVal = lab;
  }
  if (practice > bestVal) {
    best = "Practice";
  }
  return best;
}

/* ---------- 9) Модифікації ---------- */

/** Перепризначити аудиторію для заняття (lessonId = індекс у schedule). */
export function reassignClassroom(
    lessonId: number,
    newClassroomNumber: string
): boolean {
  if (lessonId < 0 || lessonId >= schedule.length) return false;
  const room = getClassroomByNumber(newClassroomNumber);
  if (!room) return false;

  const current = schedule[lessonId];
  const candidate: Lesson = {
    courseId: current.courseId,
    professorId: current.professorId,
    classroomNumber: newClassroomNumber,
    dayOfWeek: current.dayOfWeek,
    timeSlot: current.timeSlot,
  };

  // Тимчасово прибираємо поточний урок зі списку для коректної перевірки
  const removed = schedule.splice(lessonId, 1)[0];
  const conflict = validateLesson(candidate);
  if (conflict) {
    // повертаємо назад, якщо конфлікт
    schedule.splice(lessonId, 0, removed);
    return false;
  }
  // конфліктів немає — зберігаємо оновлений урок
  schedule.splice(lessonId, 0, candidate);
  return true;
}

/** Скасувати заняття (lessonId = індекс у schedule). */
export function cancelLesson(lessonId: number): void {
  if (lessonId < 0 || lessonId >= schedule.length) return;
  schedule.splice(lessonId, 1);
}

/* ---------- 10) Невеликий приклад (можна видалити) ---------- */

// seed дані для перевірки (бажано прибрати в реальному проєкті)
addProfessor({ id: 1, name: "Dr. Smith", department: "Math" });
addProfessor({ id: 2, name: "Prof. Brown", department: "CS" });

addClassroom({ number: "A101", capacity: 60, hasProjector: true });
addClassroom({ number: "B202", capacity: 40, hasProjector: false });

addCourse({ id: 100, name: "Calculus", type: "Lecture" });
addCourse({ id: 200, name: "Algorithms", type: "Lab" });

// Додаємо уроки
addLesson({
  courseId: 100,
  professorId: 1,
  classroomNumber: "A101",
  dayOfWeek: "Monday",
  timeSlot: "8:30-10:00",
});

addLesson({
  courseId: 200,
  professorId: 2,
  classroomNumber: "B202",
  dayOfWeek: "Monday",
  timeSlot: "10:15-11:45",
});

console.log("=== DEMO START ===");

export function resetAll(): void {
  professors.length = 0;
  classrooms.length = 0;
  courses.length = 0;
  schedule.length = 0;
}

resetAll();

// 1) Додаємо дані
addProfessor({ id: 1, name: "Dr. Smith", department: "Math" });
addProfessor({ id: 2, name: "Prof. Brown", department: "CS" });

addClassroom({ number: "A101", capacity: 60, hasProjector: true });
addClassroom({ number: "B202", capacity: 40, hasProjector: false });

addCourse({ id: 100, name: "Calculus", type: "Lecture" });
addCourse({ id: 200, name: "Algorithms", type: "Lab" });

// 2) Додаємо уроки
console.log(
    "Додаємо урок:",
    addLesson({
      courseId: 100,
      professorId: 1,
      classroomNumber: "A101",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00",
    })
); // true

console.log(
    "Додаємо урок:",
    addLesson({
      courseId: 200,
      professorId: 2,
      classroomNumber: "B202",
      dayOfWeek: "Monday",
      timeSlot: "10:15-11:45",
    })
); // true

// 3) Перевіряємо конфлікт (один викладач у той самий час)
console.log(
    "Спроба додати конфлікт (повторний слот з тим же професором):",
    addLesson({
      courseId: 100,
      professorId: 1,
      classroomNumber: "B202",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00",
    })
); // false (конфлікт)

// 4) Вільні аудиторії
console.log(
    "Вільні аудиторії в понеділок 8:30-10:00:",
    findAvailableClassrooms("8:30-10:00", "Monday")
);

// 5) Розклад викладача
console.log("Розклад Dr. Smith:", getProfessorSchedule(1));

// 6) Відсоток використання аудиторії
console.log("Використання A101:", getClassroomUtilization("A101"), "%");

// 7) Найпопулярніший тип занять
console.log("Найпопулярніший тип занять:", getMostPopularCourseType());

// 8) Перепризначення аудиторії
console.log("Переназначення аудиторії для урока 0:", reassignClassroom(0, "B202"));

// 9) Скасування заняття
cancelLesson(1);
console.log("Розклад після відміни другого уроку:", schedule);

console.log("=== DEMO END ===");
