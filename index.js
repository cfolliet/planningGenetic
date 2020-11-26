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

const MAX_POP = 500;

function getPopulation(old = []) {
    let pop = [];

    // keep best score
    pop = old.sort((a, b) => b.score - a.score).slice(0, 10);

    //complete with random
    for (let index = pop.length - 1; index < MAX_POP; index++) {
        pop.push(getRandomCalendar());
    }

    return pop;
}

function run() {
    const maxRun = 1000;
    let nbRun = 0;

    let population = getPopulation([]);

    while (nbRun < maxRun) {
        nbRun++;
        population.forEach(calendar => evaluate(calendar));
        population = getPopulation(population);
        console.log(nbRun + '/' + maxRun)
    }

    const bestCalendar = population.sort((a, b) => b.score - a.score)[0];
    console.log(bestCalendar);
}

run()