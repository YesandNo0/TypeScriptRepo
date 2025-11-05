/* =========================
 *  ENUMS
 * ========================= */

enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled",
}

enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special",
}

enum Semester {
    First = "First",
    Second = "Second",
}

/** Оцінки (шкала 5–2) */
enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2,
}

enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering",
}

/* =========================
 *  ІНТЕРФЕЙСИ ДАНИХ
 * ========================= */

interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number; // курс навчання (1..6)
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

/**
 * NOTE: у завданні інтерфейс також названо Grade, що конфліктує з enum Grade.
 * Тому тут називається GradeRecord — це запис про виставлену оцінку.
 */
interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

/* =========================
 *  КЛАС УПРАВЛІННЯ
 * ========================= */

class UniversityManagementSystem {
    /** Сховище студентів/курсів/оцінок */
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: GradeRecord[] = [];

    /** Реєстрації на курси: courseId -> Set<studentId> */
    private courseRegistrations: Map<number, Set<number>> = new Map();
    /** Зручний індекс: studentId -> Set<courseId> */
    private studentRegistrations: Map<number, Set<number>> = new Map();

    /** Лічильники авто-ID */
    private studentIdSeq = 1;
    private courseIdSeq = 1;

    /* ========== СЕРВІСНІ МЕТОДИ (допоміжні) ========== */

    private requireStudent(studentId: number): Student {
        const s = this.students.find((st) => st.id === studentId);
        if (!s) throw new Error(`Student #${studentId} not found`);
        return s;
    }

    private requireCourse(courseId: number): Course {
        const c = this.courses.find((cr) => cr.id === courseId);
        if (!c) throw new Error(`Course #${courseId} not found`);
        return c;
    }

    private isRegistered(studentId: number, courseId: number): boolean {
        return this.courseRegistrations.get(courseId)?.has(studentId) ?? false;
    }

    private ensureRegistrationMaps(studentId: number, courseId: number): void {
        if (!this.courseRegistrations.has(courseId)) {
            this.courseRegistrations.set(courseId, new Set());
        }
        if (!this.studentRegistrations.has(studentId)) {
            this.studentRegistrations.set(studentId, new Set());
        }
    }

    /* ========== API ДЛЯ ДЕМо/СТВОРЕННЯ КУРСІВ (опціонально) ========== */

    /**
     * Додати курс у систему (утиліта для заповнення даних).
     * id призначається автоматично.
     */
    public addCourse(course: Omit<Course, "id">): Course {
        // Валідації базові
        if (course.credits <= 0) throw new Error("credits must be > 0");
        if (course.maxStudents <= 0) throw new Error("maxStudents must be > 0");

        const withId: Course = { id: this.courseIdSeq++, ...course };
        this.courses.push(withId);
        return withId;
    }

    /* ========== ОБОВʼЯЗКОВІ МЕТОДИ ========== */

    /**
     * enrollStudent — створює студента (id авто), повертає створеного
     */
    public enrollStudent(student: Omit<Student, "id">): Student {
        // Валідація базових полів
        if (!student.fullName?.trim()) throw new Error("fullName is required");
        if (student.year < 1 || student.year > 6) throw new Error("year must be 1..6");
        if (!(student.enrollmentDate instanceof Date)) throw new Error("enrollmentDate must be Date");
        if (!student.groupNumber?.trim()) throw new Error("groupNumber is required");

        const withId: Student = { id: this.studentIdSeq++, ...student };
        this.students.push(withId);
        return withId;
    }

    /**
     * registerForCourse — реєстрація студента на курс із валідаціями:
     * - студент і курс існують
     * - студент активний
     * - збіг факультету курсу і студента
     * - не перевищено ліміт місць
     * - не дублюємо реєстрацію
     */
    public registerForCourse(studentId: number, courseId: number): void {
        const student = this.requireStudent(studentId);
        const course = this.requireCourse(courseId);

        if (student.status !== StudentStatus.Active) {
            throw new Error(`Student #${studentId} is not Active (status=${student.status})`);
        }
        if (student.faculty !== course.faculty) {
            throw new Error(`Faculty mismatch: student=${student.faculty}, course=${course.faculty}`);
        }

        this.ensureRegistrationMaps(studentId, courseId);

        const courseSet = this.courseRegistrations.get(courseId)!;
        if (courseSet.has(studentId)) return; // вже зареєстрований — ок, без дубля

        if (courseSet.size >= course.maxStudents) {
            throw new Error(`Course #${courseId} is full (${course.maxStudents})`);
        }

        // Реєструємо
        courseSet.add(studentId);
        this.studentRegistrations.get(studentId)!.add(courseId);
    }

    /**
     * setGrade — виставлення оцінки:
     * - студент/курс існують
     * - студент зареєстрований на курс
     */
    public setGrade(studentId: number, courseId: number, grade: Grade): void {
        const student = this.requireStudent(studentId);
        const course = this.requireCourse(courseId);

        if (!this.isRegistered(student.id, course.id)) {
            throw new Error(`Student #${studentId} is not registered for course #${courseId}`);
        }

        const record: GradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester,
        };

        // Якщо вже є оцінка за курс — оновлюємо (останнє слово за останньою оцінкою)
        const idx = this.grades.findIndex(
            (g) => g.studentId === studentId && g.courseId === courseId
        );
        if (idx >= 0) this.grades[idx] = record;
        else this.grades.push(record);
    }

    /**
     * updateStudentStatus — змінити статус студента з валідацією простих правил:
     * - Перехід у Graduated можливий лише для Active і за наявності хоча б однієї оцінки >= Satisfactory
     * - Перехід у Expelled можливий з будь-якого, окрім Graduated
     * - Academic_Leave ↔ Active дозволені
     * - Graduated — фінальна стадія (назад не можна)
     */
    public updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.requireStudent(studentId);

        // Якщо вже Graduated — дозволяємо лише залишатися Graduated
        if (student.status === StudentStatus.Graduated) {
            if (newStatus !== StudentStatus.Graduated) {
                throw new Error("Cannot change status after Graduated");
            }
            return;
        }

        // Перехід у Graduated можливий лише за наявності хоч однієї «складеної» оцінки
        if (newStatus === StudentStatus.Graduated) {
            const grades = this.getStudentGrades(studentId);
            const hasAnyPass = grades.length > 0 && grades.some((g) => g.grade >= Grade.Satisfactory);
            if (!hasAnyPass) {
                throw new Error("Cannot graduate without any passing grade");
            }
        }

        // Academic_Leave ↔ Active — ок; Expelled — ок (поки студент не Graduated, що вже покрито вище)
        student.status = newStatus;
    }


    /** Повернути студентів факультету */
    public getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter((s) => s.faculty === faculty);
    }

    /** Повернути усі оцінки студента */
    public getStudentGrades(studentId: number): GradeRecord[] {
        this.requireStudent(studentId);
        return this.grades.filter((g) => g.studentId === studentId);
    }

    /**
     * Курси, доступні для запису за факультетом і семестром (де ще є місця).
     */
    public getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter((c) => {
            if (c.faculty !== faculty || c.semester !== semester) return false;
            const size = this.courseRegistrations.get(c.id)?.size ?? 0;
            return size < c.maxStudents;
        });
    }

    /**
     * Середній бал студента (0, якщо оцінок нема).
     */
    public calculateAverageGrade(studentId: number): number {
        const list = this.getStudentGrades(studentId);
        if (list.length === 0) return 0;
        const sum = list.reduce((acc, g) => acc + g.grade, 0);
        return sum / list.length;
    }

    /**
     * ДОДАТКОВЕ: список відмінників по факультету.
     * Студент вважається відмінником, якщо середня оцінка строго > 4.5 (або всі оцінки — Excellent).
     * Порожні журнали оцінок не враховуються.
     */
    public getExcellentStudentsByFaculty(faculty: Faculty): Student[] {
        const studs = this.getStudentsByFaculty(faculty);
        return studs.filter((s) => {
            const gs = this.getStudentGrades(s.id);
            if (gs.length === 0) return false;
            const avg = gs.reduce((acc, g) => acc + g.grade, 0) / gs.length;
            return avg > 4.5; // поріг відмінника
        });
    }
}

/* =========================
 *  ПРИКЛАД ВИКОРИСТАННЯ
 * ========================= */

const ums = new UniversityManagementSystem();

// Додаємо курси
const cs101 = ums.addCourse({
  name: "Algorithms",
  type: CourseType.Mandatory,
  credits: 6,
  semester: Semester.First,
  faculty: Faculty.Computer_Science,
  maxStudents: 2,
});
const cs201 = ums.addCourse({
  name: "Databases",
  type: CourseType.Special,
  credits: 5,
  semester: Semester.Second,
  faculty: Faculty.Computer_Science,
  maxStudents: 1,
});

// Реєструємо студентів
const st1 = ums.enrollStudent({
  fullName: "Іван Іванов",
  faculty: Faculty.Computer_Science,
  year: 1,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2024-09-01"),
  groupNumber: "CS-101",
});
const st2 = ums.enrollStudent({
  fullName: "Марія Петренко",
  faculty: Faculty.Computer_Science,
  year: 1,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2024-09-01"),
  groupNumber: "CS-101",
});

// Запис на курси
ums.registerForCourse(st1.id, cs101.id);
ums.registerForCourse(st2.id, cs101.id);

// Виставляємо оцінки
ums.setGrade(st1.id, cs101.id, Grade.Excellent);
ums.setGrade(st2.id, cs101.id, Grade.Good);

// Середній бал
console.log("AVG st1 =", ums.calculateAverageGrade(st1.id)); // 5
console.log("Excellent CS =", ums.getExcellentStudentsByFaculty(Faculty.Computer_Science).map(s => s.fullName)); // [Іванов]

// Спроба випустити без достатніх оцінок
try {
  ums.updateStudentStatus(st2.id, StudentStatus.Graduated);
} catch (e) {
  console.log("Graduate error:", (e as Error).message);
}

// Випуск ст1
ums.updateStudentStatus(st1.id, StudentStatus.Graduated);
console.log("st1 status =", ums.getStudentsByFaculty(Faculty.Computer_Science).find(s => s.id === st1.id)?.status);
