function getWeek() {
    mon = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null, n2: null } };
    fri = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null } };
    sat = () => { return { m1: null, d1: null, e1: null, n1: null } };

    const week = [mon(), mon(), mon(), mon(), fri(), sat(), sat()];
    return week;
}

function getCalendar() {
    const NB_WEEK = 10;
    let calendar = [];
    for (let i = 0; i < NB_WEEK; i++) {
        calendar = calendar.concat(getWeek());
    }
    return calendar;
}

function getRandomCalendar() {
    const NB_PEOPLE = 10;
    const calendar = getCalendar();

    calendar.forEach(day => {
        for (let slot in day) {
            day[slot] = Math.floor(Math.random() * NB_PEOPLE);
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

function copy(calendar) {
    const copy = getCalendar();

    calendar.forEach((day, index) => {
        for (let slot in day) {
            copy[index][slot] = day[slot];
        }
    })

    return copy;
}

function mutate(calendar) {
    const MUTATION_RATE = 0.1;
    calendar.forEach(day => {
        for (let slot in day) {
            if (Math.random() < MUTATION_RATE) {
                day[slot] = Math.floor(Math.random() * 10);
            }
        }
    })
    return calendar;
}

function breed(a, b) {
    let c = getCalendar();
    let d = getCalendar();

    a.forEach((day, index) => {
        for (let slot in day) {
            if (index % 2) {
                c[index][slot] = day[slot];
                d[index][slot] = b[index][slot];
            } else {
                c[index][slot] = b[index][slot];
                d[index][slot] = day[slot];
            }
        }
    });

    return [c, d]
}

function getSubPopulation(population, nb) {
    const pop = [];

    for (let i = 0; i < nb; i++) {
        pop.push(population[Math.floor(Math.random() * population.length)])
    }

    return pop;
}

const MAX_POP = 500;

function getPopulation(old = []) {
    let population = [];

    // sort by score
    old.sort((a, b) => b.score - a.score);

    // keep bests score
    population = old.slice(0, 10);

    // mutate some
    if (population.length) {
        population = population.concat(old.slice(0, Math.floor(old.length / 3)).map(calendar => mutate(copy(calendar))));
    }

    // breed other
    if (population.length) {
        const parents = old.slice(0, Math.floor(old.length / 3));
        let previous = parents[0];
        for (let i = 1; i < parents.length; i += 2) {
            const element = parents[i];
            population = population.concat(breed(previous, element));
            previous = element;
        }
    }

    //complete with random
    for (let index = population.length; index < MAX_POP; index++) {
        population.push(getRandomCalendar());
    }

    return population;
}

function run() {
    const maxRun = 500;
    let nbRun = 0;

    let population = [];

    while (nbRun < maxRun) {
        nbRun++;
        population = getPopulation(population);
        population.forEach(calendar => evaluate(calendar));
        console.log(nbRun + '/' + maxRun + ' best: ' + population.sort((a, b) => b.score - a.score)[0].score)
    }

    const bestCalendar = population.sort((a, b) => b.score - a.score)[0];
    console.log(bestCalendar);
}

run()