function getWeek() {
    mon = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null, n2: null } };
    fri = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null } };
    sat = () => { return { m1: null, d1: null, e1: null, n1: null } };

    const week = [mon(), mon(), mon(), mon(), fri(), sat(), sat()];
    return week;
}

function getCalendar() {
    return getWeek().concat(getWeek(), getWeek(), getWeek());
}

function getRandomCalendar() {
    const calendar = getCalendar();

    calendar.forEach(day => {
        for (let slot in day) {
            day[slot] = Math.floor(Math.random() * 10);
        }
    })

    return calendar;
}

function evaluate(calendar) {
    calendar.score = 0;
    mustWorkOncePerDay(calendar);
}

function mustWorkOncePerDay(calendar) {
    calendar.forEach(day => {
        let hasDuplicate = false;

        for (let slot in day) {
            for (let slot2 in day) {
                if (slot != slot2 && day[slot] == day[slot2]) {
                    hasDuplicate = true;
                }
            }
        }

        if (!hasDuplicate) {
            calendar.score++;
        }
    })
}

function run() {
    const maxRun = 500000;
    let nbRun = 0;

    let best = null;

    while (nbRun < maxRun) {
        nbRun++;
        let calendar = getRandomCalendar();
        evaluate(calendar);
        if (best == null || best.score < calendar.score) {
            best = calendar;
        }
        console.log(nbRun + '/' + maxRun)
    }

    console.log(best);
}

run()