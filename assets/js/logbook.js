document.addEventListener(
    "DOMContentLoaded",
    initialiseLogbook
);



/* ========================================
   STATE
======================================== */

let entries = [];

let practicumStart = null;

let weekOneStart = null;

let selectedWeek = 1;

let calendarCursor = new Date();



/* ========================================
   INITIALISE
======================================== */

async function initialiseLogbook() {

    const app =
        document.getElementById("logbookApp");


    practicumStart =
        lbCreateDate(
            app.dataset.practicumStart
        );


    /*
        Week 1 always follows Monday-Friday.

        If practicum officially starts on a Monday,
        that Monday becomes Week 1 directly.
    */

    weekOneStart =
        lbGetMonday(practicumStart);


    setupDrawer();

    setupViewSwitch();

    setupCalendarNavigation();


    try {

        const response =
            await fetch(
                "data/logbook.json"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load logbook.json"
            );

        }


        entries =
            await response.json();


        entries.sort(
            (a, b) =>
                lbCreateDate(a.date)
                -
                lbCreateDate(b.date)
        );


        if (entries.length === 0) {

            showEmptyLogbook();

            renderCalendar();

            return;

        }


        /*
            Default:
            select the week containing
            the latest logbook entry.
        */

        const latestEntry =
            entries[
                entries.length - 1
            ];


        const latestDate =
            lbCreateDate(
                latestEntry.date
            );


        selectedWeek =
            getPracticumWeek(
                latestDate
            );


        calendarCursor =
            new Date(
                latestDate.getFullYear(),
                latestDate.getMonth(),
                1
            );


        renderTimeline();

        selectWeek(
            selectedWeek,
            false
        );

    }

    catch (error) {

        console.error(error);


        document.getElementById(
            "weekTimeline"
        ).innerHTML =
            `
            <div class="logbook-error">
                Unable to load logbook data.
                Please check data/logbook.json.
            </div>
            `;

    }

}



/* ========================================
   SELECT WEEK
======================================== */

function selectWeek(
    weekNumber,
    closeMobile = true
) {

    selectedWeek =
        weekNumber;


    renderWeek();

    updateTimelineSelection();

    renderCalendar();


    if (closeMobile) {

        closeWeekDrawer();

    }

}



/* ========================================
   RENDER FULL WEEK
======================================== */

function renderWeek() {

    const weekStart =
        getWeekStart(
            selectedWeek
        );


    const friday =
        lbAddDays(
            weekStart,
            4
        );


    /*
        Heading
    */

    document.getElementById(
        "weekTitle"
    ).textContent =
        `Week ${selectedWeek}`;


    document.getElementById(
        "weekNumberBadge"
    ).textContent =
        `Week ${selectedWeek}`;


    document.getElementById(
        "weekDateRange"
    ).textContent =
        `${lbFormatShortDate(weekStart)} — ${lbFormatShortDate(friday)}`;


    /*
        Monday - Friday
    */

    const container =
        document.getElementById(
            "weekEntryList"
        );


    container.innerHTML = "";


    for (
        let dayIndex = 0;
        dayIndex < 5;
        dayIndex++
    ) {

        const currentDate =
            lbAddDays(
                weekStart,
                dayIndex
            );


        const dateKey =
            lbDateKey(
                currentDate
            );


        const entry =
            entries.find(
                item =>
                    item.date === dateKey
            );


        container.appendChild(
            buildDayCard(
                currentDate,
                entry
            )
        );

    }

}



/* ========================================
   BUILD MONDAY-FRIDAY CARD
======================================== */

function buildDayCard(
    date,
    entry
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "weekday-entry-card";


    const header =
        document.createElement(
            "header"
        );


    header.className =
        "weekday-entry-header";


    const dayBlock =
        document.createElement(
            "div"
        );


    const dayName =
        document.createElement(
            "p"
        );


    dayName.className =
        "weekday-name";


    dayName.textContent =
        new Intl.DateTimeFormat(
            "en-MY",
            {
                weekday: "long"
            }
        ).format(date);


    const fullDate =
        document.createElement(
            "h2"
        );


    fullDate.textContent =
        lbFormatLongDate(date);


    dayBlock.append(
        dayName,
        fullDate
    );


    const dateCode =
        document.createElement(
            "span"
        );


    dateCode.className =
        "weekday-date-code";


    dateCode.textContent =
        lbDateKey(date);


    header.append(
        dayBlock,
        dateCode
    );


    card.appendChild(
        header
    );


    /*
        Day before official practicum start
    */

    if (date < practicumStart) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "no-entry-state";


        empty.textContent =
            "Outside the practicum period.";


        card.appendChild(
            empty
        );


        return card;

    }


    /*
        No entry for that weekday
    */

    if (!entry) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "no-entry-state";


        empty.innerHTML =
            `
            <strong>No logbook entry recorded.</strong>
            <span>
                No daily or project tasks are available for this date.
            </span>
            `;


        card.appendChild(
            empty
        );


        return card;

    }


    /*
        Daily + Project grid
    */

    const body =
        document.createElement(
            "div"
        );


    body.className =
        "weekday-task-grid";


    body.appendChild(
        buildTaskSection(
            "Daily Tasks",
            "DAILY RECORD",
            entry.dailyTasks,
            "No daily task recorded."
        )
    );


    body.appendChild(
        buildTaskSection(
            "Project Tasks",
            "PROJECT RECORD",
            entry.projectTasks,
            "No project task recorded."
        )
    );


    card.appendChild(
        body
    );


    return card;

}



/* ========================================
   TASK SECTION
======================================== */

function buildTaskSection(
    title,
    label,
    tasks,
    emptyText
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "weekday-task-section";


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "weekday-task-heading";


    heading.innerHTML =
        `
        <p>${label}</p>
        <h3>${title}</h3>
        `;


    section.appendChild(
        heading
    );


    if (
        !Array.isArray(tasks)
        ||
        tasks.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "weekday-task-empty";


        empty.textContent =
            emptyText;


        section.appendChild(
            empty
        );


        return section;

    }


    const list =
        document.createElement(
            "ul"
        );


    list.className =
        "weekday-task-list";


    tasks.forEach(task => {

        const item =
            document.createElement(
                "li"
            );


        item.textContent =
            task;


        list.appendChild(
            item
        );

    });


    section.appendChild(
        list
    );


    return section;

}



/* ========================================
   TIMELINE
======================================== */

function renderTimeline() {

    const timeline =
        document.getElementById(
            "weekTimeline"
        );


    timeline.innerHTML = "";


    /*
        Generate every practicum week
        from Week 1 until latest recorded week.
    */

    const latestDate =
        lbCreateDate(
            entries[
                entries.length - 1
            ].date
        );


    const latestWeek =
        getPracticumWeek(
            latestDate
        );


    const grouped =
        new Map();


    for (
        let week = 1;
        week <= latestWeek;
        week++
    ) {

        const monday =
            getWeekStart(
                week
            );


        const friday =
            lbAddDays(
                monday,
                4
            );


        /*
            Group by the Friday's month.

            Example:
            28 Sep - 02 Oct
            will appear under October.
        */

        const monthKey =
            `${friday.getFullYear()}-${String(
                friday.getMonth() + 1
            ).padStart(2, "0")}`;


        const monthLabel =
            new Intl.DateTimeFormat(
                "en-MY",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(friday);


        if (!grouped.has(monthKey)) {

            grouped.set(
                monthKey,
                {
                    label: monthLabel,
                    weeks: []
                }
            );

        }


        grouped
            .get(monthKey)
            .weeks
            .push({
                week,
                monday,
                friday
            });

    }


    /*
        Latest month first
    */

    const months =
        Array.from(
            grouped.values()
        ).reverse();


    months.forEach(
        (month, index) => {

            const details =
                document.createElement(
                    "details"
                );


            details.className =
                "timeline-month";


            if (index === 0) {

                details.open = true;

            }


            const summary =
                document.createElement(
                    "summary"
                );


            summary.className =
                "timeline-month-heading";


            summary.textContent =
                month.label;


            details.appendChild(
                summary
            );


            const weekList =
                document.createElement(
                    "div"
                );


            weekList.className =
                "timeline-week-list";


            [...month.weeks]
                .reverse()
                .forEach(item => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "timeline-week-button";


                    button.dataset.week =
                        item.week;


                    button.innerHTML =
                        `
                        <strong>
                            Week ${item.week}
                        </strong>

                        <span>
                            ${lbFormatTinyDate(item.monday)}
                            —
                            ${lbFormatTinyDate(item.friday)}
                        </span>
                        `;


                    button.addEventListener(
                        "click",
                        () => {

                            selectWeek(
                                item.week
                            );

                        }
                    );


                    weekList.appendChild(
                        button
                    );

                });


            details.appendChild(
                weekList
            );


            timeline.appendChild(
                details
            );

        }
    );

}



/* ========================================
   TIMELINE SELECTED WEEK
======================================== */

function updateTimelineSelection() {

    document
        .querySelectorAll(
            ".timeline-week-button"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                Number(
                    button.dataset.week
                )
                ===
                selectedWeek
            );

        });

}



/* ========================================
   CALENDAR
======================================== */

function renderCalendar() {

    const grid =
        document.getElementById(
            "calendarGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const year =
        calendarCursor.getFullYear();


    const month =
        calendarCursor.getMonth();


    document.getElementById(
        "calendarMonthTitle"
    ).textContent =
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


    /*
        Monday-first calendar.

        JS:
        Sunday = 0
        Monday = 1

        Convert:
        Monday = 0
        ...
        Sunday = 6
    */

    const firstDate =
        new Date(
            year,
            month,
            1
        );


    const firstDayOffset =
        (
            firstDate.getDay()
            + 6
        ) % 7;


    for (
        let i = 0;
        i < firstDayOffset;
        i++
    ) {

        const blank =
            document.createElement(
                "span"
            );


        blank.className =
            "mini-calendar-empty";


        grid.appendChild(
            blank
        );

    }


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const todayKey =
        lbDateKey(
            new Date()
        );


    const selectedStart =
        getWeekStart(
            selectedWeek
        );


    const selectedEnd =
        lbAddDays(
            selectedStart,
            4
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


        const key =
            lbDateKey(
                date
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "mini-calendar-day";


        button.textContent =
            day;


        const hasEntry =
            entries.some(
                entry =>
                    entry.date === key
            );


        if (hasEntry) {

            button.classList.add(
                "has-entry"
            );

        }


        if (key === todayKey) {

            button.classList.add(
                "today"
            );

        }


        if (
            date >= selectedStart
            &&
            date <= selectedEnd
        ) {

            button.classList.add(
                "selected-week"
            );

        }


        button.addEventListener(
            "click",
            () => {

                const week =
                    getPracticumWeek(
                        date
                    );


                if (week >= 1) {

                    selectWeek(
                        week
                    );

                }

            }
        );


        grid.appendChild(
            button
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
   CALENDAR / TIMELINE VIEW
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

    document
        .getElementById(
            "weekDrawerToggle"
        )
        .addEventListener(
            "click",
            openWeekDrawer
        );


    document
        .getElementById(
            "weekDrawerClose"
        )
        .addEventListener(
            "click",
            closeWeekDrawer
        );


    document
        .getElementById(
            "weekDrawerOverlay"
        )
        .addEventListener(
            "click",
            closeWeekDrawer
        );

}



function openWeekDrawer() {

    document
        .getElementById(
            "weekSidebar"
        )
        .classList.add(
            "open"
        );


    document
        .getElementById(
            "weekDrawerOverlay"
        )
        .classList.add(
            "open"
        );


    document.body.style.overflow =
        "hidden";

}



function closeWeekDrawer() {

    document
        .getElementById(
            "weekSidebar"
        )
        .classList.remove(
            "open"
        );


    document
        .getElementById(
            "weekDrawerOverlay"
        )
        .classList.remove(
            "open"
        );


    document.body.style.overflow =
        "";

}



/* ========================================
   WEEK CALCULATION
======================================== */

function getPracticumWeek(date) {

    const millisecondsPerDay =
        86400000;


    const difference =
        Math.floor(
            (
                lbNormaliseDate(date)
                -
                lbNormaliseDate(
                    weekOneStart
                )
            )
            /
            millisecondsPerDay
        );


    return (
        Math.floor(
            difference / 7
        )
        + 1
    );

}



function getWeekStart(
    weekNumber
) {

    return lbAddDays(
        weekOneStart,
        (
            weekNumber - 1
        )
        * 7
    );

}



/* ========================================
   DATE HELPERS
======================================== */

function lbCreateDate(
    dateString
) {

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



function lbNormaliseDate(
    date
) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}



function lbGetMonday(
    date
) {

    const result =
        lbNormaliseDate(date);


    const day =
        result.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    result.setDate(
        result.getDate()
        +
        difference
    );


    return result;

}



function lbAddDays(
    date,
    amount
) {

    const result =
        new Date(date);


    result.setDate(
        result.getDate()
        +
        amount
    );


    return result;

}



function lbDateKey(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



function lbFormatLongDate(
    date
) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);

}



function lbFormatShortDate(
    date
) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}



function lbFormatTinyDate(
    date
) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            day: "2-digit",
            month: "short"
        }
    ).format(date);

}



/* ========================================
   EMPTY LOGBOOK
======================================== */

function showEmptyLogbook() {

    document.getElementById(
        "weekTimeline"
    ).innerHTML =
        `
        <div class="no-entry-state">
            No logbook entries are available yet.
        </div>
        `;


    document.getElementById(
        "weekEntryList"
    ).innerHTML =
        `
        <div class="no-entry-state">
            Add your first record to
            data/logbook.json.
        </div>
        `;

}