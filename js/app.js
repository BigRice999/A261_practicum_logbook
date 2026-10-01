/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStudentInformation();

        renderCalendar();

        renderTimeline();

        updateOverview();

        setupNavigation();

        setupViewSwitcher();

        setupMonthControls();

        setupModal();

        setupMobileMenu();

    }
);


/* =========================================
   STUDENT INFORMATION
========================================= */

function loadStudentInformation() {

    document.getElementById("student-name")
        .textContent = studentInfo.name;

    document.getElementById("student-matric")
        .textContent = studentInfo.matricNo;

    document.getElementById("student-programme")
        .textContent = studentInfo.programme;

    document.getElementById("student-university")
        .textContent = studentInfo.university;

    document.getElementById("student-company")
        .textContent = studentInfo.company;

    document.getElementById("student-department")
        .textContent = studentInfo.department;

    document.getElementById("student-supervisor")
        .textContent = studentInfo.supervisor;

    document.getElementById("student-period")
        .textContent = studentInfo.practicumPeriod;

}


/* =========================================
   OVERVIEW
========================================= */

function updateOverview() {

    const totalEntries =
        Object.keys(entries).length;


    document.getElementById("days-recorded")
        .textContent = totalEntries;


    document.getElementById("total-weeks")
        .textContent = studentInfo.totalWeeks;


    /*
        Determine latest week
    */

    const weeks =
        Object.values(entries)
            .map(entry => entry.week);


    const currentWeek =
        weeks.length
            ? Math.max(...weeks)
            : 1;


    document.getElementById("current-week")
        .textContent = currentWeek;

}


/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;


                /*
                    Update active navigation
                */

                navItems.forEach(nav =>
                    nav.classList.remove("active")
                );

                item.classList.add("active");


                /*
                    Hide all pages
                */

                document
                    .querySelectorAll(".page")
                    .forEach(pageElement =>
                        pageElement.classList.remove(
                            "active-page"
                        )
                    );


                /*
                    Show selected page
                */

                document
                    .getElementById(`${page}-page`)
                    .classList.add("active-page");


                /*
                    Close mobile menu
                */

                document
                    .querySelector(".sidebar")
                    .classList.remove("mobile-open");

            }
        );

    });

}


/* =========================================
   VIEW SWITCHER
========================================= */

function setupViewSwitcher() {

    const calendarButton =
        document.getElementById(
            "calendar-view-button"
        );


    const timelineButton =
        document.getElementById(
            "timeline-view-button"
        );


    const calendarView =
        document.getElementById(
            "calendar-view"
        );


    const timelineView =
        document.getElementById(
            "timeline-view"
        );


    calendarButton.addEventListener(
        "click",
        () => {

            calendarButton.classList.add("active");

            timelineButton.classList.remove("active");

            calendarView.classList.add("active-view");

            timelineView.classList.remove("active-view");

        }
    );


    timelineButton.addEventListener(
        "click",
        () => {

            timelineButton.classList.add("active");

            calendarButton.classList.remove("active");

            timelineView.classList.add("active-view");

            calendarView.classList.remove("active-view");

        }
    );

}


/* =========================================
   MONTH CONTROLS
========================================= */

function setupMonthControls() {

    document
        .getElementById("previous-month")
        .addEventListener(
            "click",
            previousMonth
        );


    document
        .getElementById("next-month")
        .addEventListener(
            "click",
            nextMonth
        );

}


/* =========================================
   TIMELINE
========================================= */

function renderTimeline() {

    const container =
        document.getElementById(
            "timeline-container"
        );


    container.innerHTML = "";


    /*
        Group entries by week
    */

    const groupedWeeks = {};


    Object.entries(entries)
        .sort(
            ([dateA], [dateB]) =>
                dateA.localeCompare(dateB)
        )
        .forEach(
            ([date, entry]) => {

                if (!groupedWeeks[entry.week]) {

                    groupedWeeks[entry.week] = [];

                }


                groupedWeeks[entry.week].push({
                    date,
                    ...entry
                });

            }
        );


    /*
        Render weeks
    */

    Object.entries(groupedWeeks)
        .forEach(
            ([week, weekEntries]) => {

                const weekElement =
                    document.createElement("div");

                weekElement.className =
                    "timeline-week";


                const weekTitle =
                    document.createElement("div");

                weekTitle.className =
                    "timeline-week-title";

                weekTitle.textContent =
                    `WEEK ${week}`;


                weekElement.appendChild(
                    weekTitle
                );


                weekEntries.forEach(
                    entry => {

                        const entryElement =
                            document.createElement("div");

                        entryElement.className =
                            "timeline-entry";


                        const formattedDate =
                            formatDate(entry.date);


                        entryElement.innerHTML = `

                            <div class="timeline-date">
                                ${formattedDate}
                            </div>

                            <h4>
                                ${entry.title}
                            </h4>

                            <p>
                                ${entry.activities[0]}
                            </p>

                        `;


                        entryElement.addEventListener(
                            "click",
                            () =>
                                openEntry(entry.date)
                        );


                        weekElement.appendChild(
                            entryElement
                        );

                    }
                );


                container.appendChild(
                    weekElement
                );

            }
        );

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(dateString) {

    const date =
        new Date(`${dateString}T00:00:00`);


    return date.toLocaleDateString(
        "en-MY",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   MODAL
========================================= */

function setupModal() {

    document
        .getElementById("close-modal")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("entry-modal")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "entry-modal"
                ) {

                    closeModal();

                }

            }
        );

}


function openEntry(dateString) {

    const entry =
        entries[dateString];


    if (!entry) return;


    document
        .getElementById("modal-date")
        .textContent =
        formatDate(dateString);


    document
        .getElementById("modal-title")
        .textContent =
        entry.title;


    document
        .getElementById("modal-week")
        .textContent =
        `Week ${entry.week}`;


    const activities =
        document.getElementById(
            "modal-activities"
        );


    activities.innerHTML = "";


    entry.activities.forEach(
        activity => {

            const li =
                document.createElement("li");

            li.textContent =
                activity;

            activities.appendChild(li);

        }
    );


    document
        .getElementById("modal-reflection")
        .textContent =
        entry.reflection;


    document
        .getElementById("entry-modal")
        .classList.add("show");

}


function closeModal() {

    document
        .getElementById("entry-modal")
        .classList.remove("show");

}


/* =========================================
   MOBILE MENU
========================================= */

function setupMobileMenu() {

    document
        .getElementById("mobile-menu-button")
        .addEventListener(
            "click",
            () => {

                document
                    .querySelector(".sidebar")
                    .classList.toggle(
                        "mobile-open"
                    );

            }
        );

}