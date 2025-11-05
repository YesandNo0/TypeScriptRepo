"use strict";
/* ---------- 1) Базові типи ---------- */
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = exports.timeSlots = exports.days = void 0;
exports.addProfessor = addProfessor;
exports.addClassroom = addClassroom;
exports.addCourse = addCourse;
exports.validateLesson = validateLesson;
exports.addLesson = addLesson;
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
exports.resetAll = resetAll;
/* ---------- 3) Дані ---------- */
exports.days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];
exports.timeSlots = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15",
];
// БД у пам'яті
exports.professors = [];
exports.classrooms = [];
exports.courses = [];
exports.schedule = [];
/* ---------- 4) Допоміжне ---------- */
// Повертає true, якщо два уроки йдуть одночасно в один і той же день
const sameSlot = (a, b) => a.dayOfWeek === b.dayOfWeek && a.timeSlot === b.timeSlot;
// Знайти курс/проф/аудиторію
const getCourseById = (id) => exports.courses.find((c) => c.id === id);
const getProfessorById = (id) => exports.professors.find((p) => p.id === id);
const getClassroomByNumber = (num) => exports.classrooms.find((c) => c.number === num);
/* ---------- 5) Додавання ---------- */
function addProfessor(professor) {
    // Унікальність id
    if (exports.professors.some((p) => p.id === professor.id)) {
        throw new Error(`Professor with id=${professor.id} already exists`);
    }
    exports.professors.push(professor);
}
function addClassroom(room) {
    if (exports.classrooms.some((c) => c.number === room.number)) {
        throw new Error(`Classroom ${room.number} already exists`);
    }
    exports.classrooms.push(room);
}
function addCourse(course) {
    if (exports.courses.some((c) => c.id === course.id)) {
        throw new Error(`Course with id=${course.id} already exists`);
    }
    exports.courses.push(course);
}
/** Перевіряє:
 *  - чи існують course/professor/classroom
 *  - чи не зайнятий професор у цей самий слот
 *  - чи не зайнята аудиторія у цей самий слот
 */
function validateLesson(lesson) {
    if (!getCourseById(lesson.courseId)) {
        throw new Error(`Course ${lesson.courseId} not found`);
    }
    if (!getProfessorById(lesson.professorId)) {
        throw new Error(`Professor ${lesson.professorId} not found`);
    }
    if (!getClassroomByNumber(lesson.classroomNumber)) {
        throw new Error(`Classroom ${lesson.classroomNumber} not found`);
    }
    for (let i = 0; i < exports.schedule.length; i++) {
        const s = exports.schedule[i];
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
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict)
        return false;
    exports.schedule.push(lesson);
    return true;
}
/* ---------- 7) Пошук/фільтри ---------- */
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    // Аудиторії, що зайняті у цей час
    const busy = new Set();
    for (let i = 0; i < exports.schedule.length; i++) {
        const s = exports.schedule[i];
        if (s.dayOfWeek === dayOfWeek && s.timeSlot === timeSlot) {
            busy.add(s.classroomNumber);
        }
    }
    // Вільні = усі - зайняті
    const result = [];
    for (let j = 0; j < exports.classrooms.length; j++) {
        const num = exports.classrooms[j].number;
        if (!busy.has(num))
            result.push(num);
    }
    return result;
}
function getProfessorSchedule(professorId) {
    const profExists = getProfessorById(professorId);
    if (!profExists)
        throw new Error(`Professor ${professorId} not found`);
    const out = [];
    for (let i = 0; i < exports.schedule.length; i++) {
        if (exports.schedule[i].professorId === professorId)
            out.push(exports.schedule[i]);
    }
    return out;
}
/* ---------- 8) Звіти/аналітика ---------- */
/** Відсоток використання аудиторії за всі робочі дні і всі слоти.
 * Формула: (кількість зайнятих слотів у цій аудиторії / (days * timeSlots)) * 100
 */
function getClassroomUtilization(classroomNumber) {
    if (!getClassroomByNumber(classroomNumber)) {
        throw new Error(`Classroom ${classroomNumber} not found`);
    }
    let used = 0;
    for (let i = 0; i < exports.schedule.length; i++) {
        if (exports.schedule[i].classroomNumber === classroomNumber)
            used++;
    }
    const total = exports.days.length * exports.timeSlots.length;
    return total === 0 ? 0 : Math.round((used / total) * 10000) / 100; // 2 знаки
}
/** Найпопулярніший тип занять за фактичними уроками у розкладі. */
function getMostPopularCourseType() {
    // Лічильники
    let lecture = 0;
    let seminar = 0;
    let lab = 0;
    let practice = 0;
    for (let i = 0; i < exports.schedule.length; i++) {
        const lesson = exports.schedule[i];
        const course = getCourseById(lesson.courseId);
        if (!course)
            continue;
        const t = course.type;
        if (t === "Lecture")
            lecture++;
        else if (t === "Seminar")
            seminar++;
        else if (t === "Lab")
            lab++;
        else
            practice++;
    }
    // Визначити максимум (стабільний порядок при рівності)
    let best = "Lecture";
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
function reassignClassroom(lessonId, newClassroomNumber) {
    if (lessonId < 0 || lessonId >= exports.schedule.length)
        return false;
    const room = getClassroomByNumber(newClassroomNumber);
    if (!room)
        return false;
    const current = exports.schedule[lessonId];
    const candidate = {
        courseId: current.courseId,
        professorId: current.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: current.dayOfWeek,
        timeSlot: current.timeSlot,
    };
    // Тимчасово прибираємо поточний урок зі списку для коректної перевірки
    const removed = exports.schedule.splice(lessonId, 1)[0];
    const conflict = validateLesson(candidate);
    if (conflict) {
        // повертаємо назад, якщо конфлікт
        exports.schedule.splice(lessonId, 0, removed);
        return false;
    }
    // конфліктів немає — зберігаємо оновлений урок
    exports.schedule.splice(lessonId, 0, candidate);
    return true;
}
/** Скасувати заняття (lessonId = індекс у schedule). */
function cancelLesson(lessonId) {
    if (lessonId < 0 || lessonId >= exports.schedule.length)
        return;
    exports.schedule.splice(lessonId, 1);
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
function resetAll() {
    exports.professors.length = 0;
    exports.classrooms.length = 0;
    exports.courses.length = 0;
    exports.schedule.length = 0;
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
console.log("Додаємо урок:", addLesson({
    courseId: 100,
    professorId: 1,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00",
})); // true
console.log("Додаємо урок:", addLesson({
    courseId: 200,
    professorId: 2,
    classroomNumber: "B202",
    dayOfWeek: "Monday",
    timeSlot: "10:15-11:45",
})); // true
// 3) Перевіряємо конфлікт (один викладач у той самий час)
console.log("Спроба додати конфлікт (повторний слот з тим же професором):", addLesson({
    courseId: 100,
    professorId: 1,
    classroomNumber: "B202",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00",
})); // false (конфлікт)
// 4) Вільні аудиторії
console.log("Вільні аудиторії в понеділок 8:30-10:00:", findAvailableClassrooms("8:30-10:00", "Monday"));
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
console.log("Розклад після відміни другого уроку:", exports.schedule);
console.log("=== DEMO END ===");
