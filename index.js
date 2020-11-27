function getWeek() {
    mon = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null, n2: null } };
    fri = () => { return { m1: null, m2: null, d1: null, e1: null, e2: null, n1: null } };
    sat = () => { return { m1: null, d1: null, e1: null, n1: null } };

    const week = [mon(), mon(), mon(), mon(), fri(), sat(), sat()];
    return week;
}

const NB_WEEK = 10;
function getCalendar() {
    let calendar = [];
    for (let i = 0; i < NB_WEEK; i++) {
        calendar = calendar.concat(getWeek());
    }
    return calendar;
}

const NB_PEOPLE = 10;
const NB_PARTIAL = 2;
function getRandomCalendar() {
    const calendar = getCalendar();
    const peopleWorkingDays = new Array(NB_PEOPLE).fill(0);

    calendar.forEach((day, dayIndex) => {
        if ((dayIndex + 1) % 7 == 0) {
            peopleWorkingDays.fill(0);
        }

        const peoples = [];
        for (let i = 0; i < NB_PEOPLE; i++) {
            if (peopleWorkingDays[i] < 6) {
                peoples.push(i);
            }
        }
        peoples.sort(() => 0.5 - Math.random());

        for (let slot in day) {
            const pId = peoples.pop();
            peopleWorkingDays[pId] = peopleWorkingDays[pId] + 1;
            day[slot] = pId;
        }
    })

    return calendar;
}

function evaluate(calendar) {
    calendar.score = 0;
    calendar.issues = [];
    mustWorkOncePerDay(calendar); // score max 70
    mustWorkNotToMuch(calendar); // score max 100;
    mustHaveRest(calendar); //score max 50
}

function mustWorkOncePerDay(calendar) {
    calendar.forEach((day, dayIndex) => {
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
        } else {
            calendar.issues.push(`Someone work twice the same day, day ${dayIndex}`);
        }
    })
}

function mustWorkNotToMuch(calendar) {
    // Temps annuel temps plein: 1547h soit 148h/ 4 semaines et 118h/4 semaines pour 80%

    for (let index = 0; index < NB_WEEK; index++) {
        let startIndex = index * 7;
        let endIndex = startIndex + 7 * 4;
        const period = calendar.slice(startIndex, endIndex);

        for (let personId = 0; personId < NB_PEOPLE; personId++) {
            let nbHours = 0;
            period.forEach(day => {
                for (let slot in day) {
                    if (day[slot] == personId) {
                        nbHours += 8;
                    }
                }
            })

            if (nbHours <= 118 || (index < NB_PEOPLE - NB_PARTIAL && nbHours <= 148)) {
                calendar.score++;
            } else {
                calendar.issues.push(`pId ${personId} work to much (${nbHours}h) from day ${startIndex} to ${endIndex} (week ${index + 1})`);
            }
        }
    }
}

function mustHaveRest(calendar) {
    // 4 RH à la quatorzaine dont 2 consécutifs dont un dimanche (de préférence samedi et dimanche mais dimanche lundi autorisé)
    for (let index = 0; index < NB_WEEK; index += 2) {
        let startIndex = index * 7;
        let endIndex = startIndex + 7 * 2;
        const period = calendar.slice(startIndex, endIndex);

        for (let personId = 0; personId < NB_PEOPLE; personId++) {
            let nbRest = 0;
            let lastRestDayIndex = null;
            let nbSatSunRest = 0;
            period.forEach((day, dayIndex) => {
                let isWorking = false;
                for (let slot in day) {
                    if (day[slot] == personId) {
                        isWorking = true;
                    }
                }

                if (!isWorking) {
                    nbRest++;
                    const isCoupled = lastRestDayIndex && (lastRestDayIndex + 1 == dayIndex);
                    const isSunday = (dayIndex + 1) % 7 == 0;
                    const isMonday = (dayIndex + 1) % 1 == 0;
                    if (isCoupled && (isSunday || isMonday)) {
                        nbSatSunRest++;
                    }
                    lastRestDayIndex = dayIndex;
                }
            });
            if (nbRest >= 4 && nbSatSunRest >= 1) {
                calendar.score++;
            } else {
                calendar.issues.push(`pId ${personId} has ${nbRest} rest, with ${nbSatSunRest} weekend from day ${startIndex} to ${endIndex} (week ${index + 1}-${index + 2})`);
            }
        }
    }
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
    population = old.slice(0, Math.floor(old.length * 0.1));

    // mutate some
    if (population.length) {
        population = population.concat(old.slice(0, Math.floor(old.length * 0.33)).map(calendar => mutate(copy(calendar))));
    }

    // breed other
    if (population.length) {
        const parents = old.slice(0, Math.floor(old.length * 0.33));
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
    const maxRun = 300;
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