document.addEventListener("DOMContentLoaded", () => {

    updatePracticumProgress();
    updateFooterYear();

});


/* ========================================
   PRACTICUM PROGRESS
======================================== */

function updatePracticumProgress() {

    const progressCard =
        document.getElementById("practicumProgress");

    if (!progressCard) {
        return;
    }


    const startDateString =
        progressCard.dataset.startDate;

    const endDateString =
        progressCard.dataset.endDate;


    const dateRange =
        document.getElementById("practicumDateRange");

    const percentageText =
        document.getElementById("progressPercentage");

    const progressFill =
        document.getElementById("progressFill");

    const progressDay =
        document.getElementById("progressDay");

    const remainingDays =
        document.getElementById("remainingDays");


    /*
        If dates have not yet been configured
    */
    if (!startDateString || !endDateString) {

        dateRange.textContent =
            "Add practicum dates";

        percentageText.textContent =
            "0%";

        progressFill.style.width =
            "0%";

        progressDay.textContent =
            "Practicum dates not configured";

        remainingDays.textContent =
            "";

        return;
    }


    const startDate =
        createLocalDate(startDateString);

    const endDate =
        createLocalDate(endDateString);


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const oneDay =
        1000 * 60 * 60 * 24;


    /*
        Total practicum duration.
        +1 means start and end dates are included.
    */
    const totalDays =
        Math.floor(
            (endDate - startDate) / oneDay
        ) + 1;


    let currentDay;
    let percentage;


    /*
        Practicum has not started
    */
    if (today < startDate) {

        currentDay = 0;
        percentage = 0;

    }

    /*
        Practicum has completed
    */
    else if (today > endDate) {

        currentDay = totalDays;
        percentage = 100;

    }

    /*
        Practicum is ongoing
    */
    else {

        currentDay =
            Math.floor(
                (today - startDate) / oneDay
            ) + 1;

        percentage =
            Math.round(
                (currentDay / totalDays) * 100
            );

    }


    percentage =
        Math.min(
            100,
            Math.max(0, percentage)
        );


    const daysRemaining =
        Math.max(
            0,
            Math.ceil(
                (endDate - today) / oneDay
            )
        );


    /*
        Update UI
    */

    dateRange.textContent =
        `${formatDate(startDate)} — ${formatDate(endDate)}`;


    percentageText.textContent =
        `${percentage}%`;


    progressFill.style.width =
        `${percentage}%`;


    if (today < startDate) {

        progressDay.textContent =
            `Starts ${formatDate(startDate)}`;

    }

    else {

        progressDay.textContent =
            `Day ${currentDay} of ${totalDays}`;

    }


    if (today > endDate) {

        remainingDays.textContent =
            "Practicum completed";

    }

    else if (today < startDate) {

        const daysUntilStart =
            Math.ceil(
                (startDate - today) / oneDay
            );

        remainingDays.textContent =
            `${daysUntilStart} days until start`;

    }

    else {

        remainingDays.textContent =
            `${daysRemaining} days remaining`;

    }

}



/* ========================================
   DATE HELPERS
======================================== */

function createLocalDate(dateString) {

    const [year, month, day] =
        dateString
            .split("-")
            .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );

}



function formatDate(date) {

    return new Intl.DateTimeFormat(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}



/* ========================================
   FOOTER YEAR
======================================== */

function updateFooterYear() {

    const year =
        document.getElementById("currentYear");

    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

}