let currentDate = new Date(2026, 8, 1);


/*
    Month names
*/

const monthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


/*
    Render Calendar
*/

function renderCalendar() {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();


    document.getElementById("current-month").textContent =
        `${monthNames[month]} ${year}`;


    const calendarDays =
        document.getElementById("calendar-days");


    calendarDays.innerHTML = "";


    /*
        First day of month

        JavaScript:
        Sunday = 0
        Monday = 1

        We convert it so:
        Monday = 0
        Sunday = 6
    */

    const firstDay =
        new Date(year, month, 1).getDay();

    const adjustedFirstDay =
        firstDay === 0 ? 6 : firstDay - 1;


    /*
        Number of days
    */

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    /*
        Empty cells before first day
    */

    for (
        let i = 0;
        i < adjustedFirstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(emptyDay);

    }


    /*
        Actual days
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        /*
            Day number
        */

        const dayNumber =
            document.createElement("div");

        dayNumber.className =
            "day-number";

        dayNumber.textContent =
            day;


        dayElement.appendChild(dayNumber);


        /*
            Check if entry exists
        */

        if (entries[dateString]) {

            const entryDot =
                document.createElement("div");

            entryDot.className =
                "entry-dot";

            entryDot.textContent =
                entries[dateString].title;


            dayElement.appendChild(entryDot);


            dayElement.addEventListener(
                "click",
                () => openEntry(dateString)
            );

        }


        /*
            Today
        */

        const today =
            new Date();

        if (

            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day

        ) {

            dayElement.classList.add("today");

        }


        calendarDays.appendChild(dayElement);

    }

}


/*
    Previous Month
*/

function previousMonth() {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

}


/*
    Next Month
*/

function nextMonth() {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

}
