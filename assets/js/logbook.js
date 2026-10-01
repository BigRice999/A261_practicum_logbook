document.addEventListener(
    "DOMContentLoaded",
    initialiseLogbook
);



/* ========================================
   GLOBAL STATE
======================================== */

let logbookEntries = [];

let selectedDate = null;

let calendarCursor = new Date();



/* ========================================
   INITIALISE
======================================== */

async function initialiseLogbook() {

    setupDrawer();

    setupViewSwitch();

    setupCalendarNavigation();


    try {

        const response =
            await fetch("data/logbook.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load logbook data."
            );

        }


        logbookEntries =
            await response.json();


        /*
            Sort oldest -> newest
        */

        logbookEntries.sort(
            (a, b) =>
                createLocalDate(a.date)
                -
                createLocalDate(b.date)
        );


        if (logbookEntries.length === 0) {

            showNoEntries();

            return;

        }


        renderTimeline();


        /*
            Default entry:

            1. Today's entry if available
            2. Otherwise latest entry
        */

        const todayKey =
            formatDateKey(new Date());


        const todayEntry =
            logbookEntries.find(
                entry =>
                    entry.date === todayKey
            );


        const defaultEntry =
            todayEntry
            ??
            logbookEntries[
                logbookEntries.length - 1
            ];


        selectedDate =
            defaultEntry.date;


        calendarCursor =
            createLocalDate(
                selectedDate
            );


        selectEntry(
            selectedDate,
            false
        );


        renderCalendar();

    }

    catch (error) {

        console.error(error);


        document.getElementById(
            "timelineList"
        ).innerHTML =
            `
            <p class="empty-task-message">
                Unable to load logbook data.
                Please check data/logbook.json.
            </p>
            `;

    }

}



/* ========================================
   SELECT ENTRY
======================================== */

function selectEntry(
    date,
    closeMobileDrawer = true
) {

    const entry =
        logbookEntries.find(
            item =>
                item.date === date
        );


    if (!entry) {
        return;
    }


    selectedDate = date;


    const entryDate =
        createLocalDate(entry.date);


    calendarCursor =
        new Date(
            entryDate.getFullYear(),
            entryDate.getMonth(),
            1
        );


    const weekNumber =
        getPracticumWeek(
            entryDate
        );


    /*
        Heading
    */

    document.getElementById(
        "selectedDateTitle"
    ).textContent =
        formatLongDate(
            entryDate
        );


    document.getElementById(
        "selectedDateCode"
    ).textContent =
        entry.date;


    const weekBadge =
        document.getElementById(
            "selectedWeekBadge"
        );


    weekBadge.hidden = false;

    weekBadge.textContent =
        `Week ${weekNumber}`;


    /*
        Tasks
    */

    renderTaskList(
        "dailyTasks",
        entry.dailyTasks,
        "No daily tasks recorded for this date."
    );


    renderTaskList(
        "projectTasks",
        entry.projectTasks,
        "No project tasks recorded for this date."
    );


    /*
        Update navigation highlights
    */

    updateTimelineSelection();

    renderCalendar();


    if (closeMobileDrawer) {

        closeDrawer();

    }

}



/* ========================================
   TASK LIST
======================================== */

function renderTaskList(
    containerId,
    tasks,
    emptyMessage
) {

    const container =
        document.getElementById(
            containerId
        );


    container.innerHTML = "";


    if (
        !Array.isArray(tasks)
        ||
        tasks.length === 0
    ) {

        const message =
            document.createElement("p");


        message.className =
            "empty-task-message";


        message.textContent =
            emptyMessage;


        container.appendChild(
            message
        );


        return;

    }


    const list =
        document.createElement("ul");


    list.className =
        "task-list";


    tasks.forEach(task => {

        const item =
            document.createElement("li");


        item.textContent =
            task;


        list.appendChild(
            item
        );

    });


    container.appendChild(
        list
    );

}



/* ========================================
   TIMELINE
======================================== */

function renderTimeline() {

    const timeline =
        document.getElementById(
            "timelineList"
        );


    timeline.innerHTML = "";


    /*
        Group:

        Month
            -> Week
                -> Entries
    */

    const grouped =
        new Map();


    logbookEntries.forEach(entry => {

        const date =
            createLocalDate(
                entry.date
            );


        const monthKey =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;


        const monthLabel =
            new Intl.DateTimeFormat(
                "en-MY",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(date);


        const week =
            getPracticumWeek(
                date
            );


        if (!grouped.has(monthKey)) {

            grouped.set(
                monthKey,
                {
                    label: monthLabel,
                    weeks: new Map()
                }
            );

        }


        const month =
            grouped.get(
                monthKey
            );


        if (!month.weeks.has(week)) {

            month.weeks.set(
                week,
                []
            );

        }


        month.weeks
            .get(week)
            .push(entry);

    });


    /*
        Show latest month first
    */

    const months =
        Array.from(
            grouped.entries()
        ).reverse();


    months.forEach(
        ([monthKey, monthData], monthIndex) => {

            const monthDetails =
                document.createElement(
                    "details"
                );


            monthDetails.className =
                "timeline-month";


            if (monthIndex === 0) {

                monthDetails.open = true;

            }


            const monthSummary =
                document.createElement(
                    "summary"
                );


            monthSummary.className =
                "timeline-month-title";


            monthSummary.textContent =
                monthData.label;


            monthDetails.appendChild(
                monthSummary
            );


            const monthContent =
                document.createElement(
                    "div"
                );


            monthContent.className =
                "timeline-month-content";


            const weeks =
                Array.from(
                    monthData.weeks.entries()
                ).reverse();


            weeks.forEach(
                ([weekNumber, entries]) => {

                    const weekDetails =
                        document.createElement(
                            "details"
                        );


                    weekDetails.className =
                        "timeline-week";


                    weekDetails.open = true;


                    const weekSummary =
                        document.createElement(
                            "summary"
                        );


                    weekSummary.className =
                        "timeline-week-title";


                    weekSummary.textContent =
                        `Week ${weekNumber}`;


                    weekDetails.appendChild(
                        weekSummary
                    );


                    const dateList =
                        document.createElement(
                            "div"
                        );


                    dateList.className =
                        "timeline-date-list";


                    /*
                        Latest date first
                    */

                    [...entries]
                        .reverse()
                        .forEach(entry => {

                            const button =
                                document.createElement(
                                    "button"
                                );


                            button.type =
                                "button";


                            button.className =
                                "timeline-date-button";


                            button.dataset.date =
                                entry.date;


                            button.textContent =
                                formatTimelineDate(
                                    createLocalDate(
                                        entry.date
                                    )
                                );


                            button.addEventListener(
                                "click",
                                () => {

                                    selectEntry(
                                        entry.date
                                    );

                                }
                            );


                            dateList.appendChild(
                                button
                            );

                        });


                    weekDetails.appendChild(
                        dateList
                    );


                    monthContent.appendChild(
                        weekDetails
                    );

                }
            );


            monthDetails.appendChild(
                monthContent
            );


            timeline.appendChild(
                monthDetails
            );

        }
    );

}



/* ========================================
   TIMELINE ACTIVE DATE
======================================== */

function updateTimelineSelection() {

    document
        .querySelectorAll(
            ".timeline-date-button"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.date
                ===
                selectedDate
            );

        });

}



/* ========================================
   CALENDAR
======================================== */

function renderCalendar() {

    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );


    const title =
        document.getElementById(
            "calendarMonthTitle"
        );


    calendarGrid.innerHTML = "";


    const year =
        calendarCursor.getFullYear();


    const month =
        calendarCursor.getMonth();


    title.textContent =
        new Intl.DateTimeFormat(
            "en-MY",
            {
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(
                year,
                month,
                1
            )
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
        Empty spaces before day 1
    */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const blank =
            document.createElement(
                "span"
            );


        blank.className =
            "calendar-day-empty";


        calendarGrid.appendChild(
            blank
        );

    }


    const todayKey =
        formatDateKey(
            new Date()
        );


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            formatDateKey(
                date
            );


        const hasEntry =
            logbookEntries.some(
                entry =>
                    entry.date
                    ===
                    dateKey
            );


        const element =
            document.createElement(
                hasEntry
                ? "button"
                : "span"
            );


        element.className =
            "calendar-day";


        element.textContent =
            day;


        if (dateKey === todayKey) {

            element.classList.add(
                "today"
            );

        }


        if (
            hasEntry
            &&
            dateKey === selectedDate
        ) {

            element.classList.add(
                "selected"
            );

        }


        if (hasEntry) {

            element.type =
                "button";


            element.addEventListener(
                "click",
                () => {

                    selectEntry(
                        dateKey
                    );

                }
            );

        }


        calendarGrid.appendChild(
            element
        );

    }

}



/* ========================================
   CALENDAR NAVIGATION
======================================== */

function setupCalendarNavigation() {

    document
        .getElementById(
            "previousMonth"
        )
        .addEventListener(
            "click",
            () => {

                calendarCursor =
                    new Date(
                        calendarCursor.getFullYear(),
                        calendarCursor.getMonth() - 1,
                        1
                    );


                renderCalendar();

            }
        );


    document
        .getElementById(
            "nextMonth"
        )
        .addEventListener(
            "click",
            () => {

                calendarCursor =
                    new Date(
                        calendarCursor.getFullYear(),
                        calendarCursor.getMonth() + 1,
                        1
                    );


                renderCalendar();

            }
        );

}



/* ========================================
   CALENDAR / TIMELINE SWITCH
======================================== */

function setupViewSwitch() {

    const calendarButton =
        document.getElementById(
            "calendarViewButton"
        );


    const timelineButton =
        document.getElementById(
            "timelineViewButton"
        );


    const calendarPanel =
        document.getElementById(
            "calendarPanel"
        );


    const timelinePanel =
        document.getElementById(
            "timelinePanel"
        );


    calendarButton.addEventListener(
        "click",
        () => {

            calendarButton
                .classList.add(
                    "active"
                );


            timelineButton
                .classList.remove(
                    "active"
                );


            calendarPanel.hidden =
                false;


            timelinePanel.hidden =
                true;


            renderCalendar();

        }
    );


    timelineButton.addEventListener(
        "click",
        () => {

            timelineButton
                .classList.add(
                    "active"
                );


            calendarButton
                .classList.remove(
                    "active"
                );


            timelinePanel.hidden =
                false;


            calendarPanel.hidden =
                true;

        }
    );

}



/* ========================================
   MOBILE DRAWER
======================================== */

function setupDrawer() {

    const openButton =
        document.getElementById(
            "drawerToggle"
        );


    const closeButton =
        document.getElementById(
            "drawerClose"
        );


    const overlay =
        document.getElementById(
            "drawerOverlay"
        );


    openButton.addEventListener(
        "click",
        openDrawer
    );


    closeButton.addEventListener(
        "click",
        closeDrawer
    );


    overlay.addEventListener(
        "click",
        closeDrawer
    );

}



function openDrawer() {

    document
        .getElementById(
            "logbookDrawer"
        )
        .classList.add(
            "open"
        );


    document
        .getElementById(
            "drawerOverlay"
        )
        .classList.add(
            "open"
        );


    document.body.style.overflow =
        "hidden";

}



function closeDrawer() {

    document
        .getElementById(
            "logbookDrawer"
        )
        .classList.remove(
            "open"
        );


    document
        .getElementById(
            "drawerOverlay"
        )
        .classList.remove(
            "open"
        );


    document.body.style.overflow =
        "";

}



/* ========================================
   PRACTICUM WEEK
======================================== */

function getPracticumWeek(date) {

    const app =
        document.getElementById(
            "logbookApp"
        );


    const startDateString =
        app.dataset.practicumStart;


    const startDate =
        createLocalDate(
            startDateString
        );


    const oneDay =
        1000 * 60 * 60 * 24;


    const difference =
        Math.floor(
            (date - startDate)
            /
            oneDay
        );


    return Math.max(
        1,
        Math.floor(
            difference / 7
        ) + 1
    );

}



/* ========================================
   DATE HELPERS
======================================== */

function createLocalDate(dateString) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}



function formatDateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}



function formatLongDate(date) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);

}



function formatTimelineDate(date) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            weekday: "short",
            day: "2-digit",
            month: "short"
        }
    ).format(date);

}



/* ========================================
   EMPTY STATE
======================================== */

function showNoEntries() {

    document.getElementById(
        "timelineList"
    ).innerHTML =
        `
        <p class="empty-task-message">
            No logbook entries are available yet.
        </p>
        `;

}