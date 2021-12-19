const lineReader = require('line-reader');
const customer = {};
const result = [];
const MAX_PER_DAY = 5000;
const MAX_PER_WEEK = 20000;
const MAX_LOADS_PER_DAY = 3;

lineReader.eachLine('input2.txt', function(line) {
  const load = JSON.parse(line);

  if (customer[load.customer_id]?.loadId !== load.id && load.customer_id === '494') {
    const loadAmount = parseFloat(load.load_amount.replace('$', ''));
    const totalLoadAmountDay = customer[load.customer_id]?.total_load_amount_day || 0;
    const totalLoadsOnDay = customer[load.customer_id]?.loads_on_day || 0;
    const lastLoadTime = customer[load.customer_id]?.load_time;

    let formatedCurrentLoadDate;
    let formatedLastLoadDate;
    let isSameDay = false;
    let accepted = false;

    if (lastLoadTime) {
      const lastLoadDate = new Date(lastLoadTime);
      const currentLoadDate = new Date(load.time);

      formatedLastLoadDate = `${lastLoadDate.getUTCFullYear()}/${lastLoadDate.getUTCMonth()+1}/${lastLoadDate.getUTCDate()}`;
      formatedCurrentLoadDate = `${currentLoadDate.getUTCFullYear()}/${currentLoadDate.getUTCMonth()+1}/${currentLoadDate.getUTCDate()}`;
      isSameDay = formatedLastLoadDate === formatedCurrentLoadDate;
    }

    const loadsOnDay = isSameDay ? totalLoadsOnDay + 1 : 1;
    const totalAmountOnDay = isSameDay ? totalLoadAmountDay + loadAmount : loadAmount;

    if (customer[load.customer_id]) {
      customer[load.customer_id].load_id = load.id;
      customer[load.customer_id].load_amount = loadAmount;
      customer[load.customer_id].load_time = load.time;
      customer[load.customer_id].total_load_amount_day = totalAmountOnDay;
      customer[load.customer_id].loads_on_day = loadsOnDay;
    } else {
      customer[load.customer_id] = {
        load_id: load.id,
        load_amount: loadAmount,
        load_time: load.time,
        total_load_amount_day: totalAmountOnDay,
        loads_on_day: loadsOnDay
      }
    }
    
    if (customer[load.customer_id].total_load_amount_day <= MAX_PER_DAY && 
        customer[load.customer_id].loads_on_day <= MAX_LOADS_PER_DAY) {
          accepted = true;
    }

    result.push({
      id: load.id,
      customer_id: load.customer_id,
      accepted
    });

    console.log(customer[load.customer_id]);
    console.log({
      id: load.id,
      customer_id: load.customer_id,
      accepted
    });

  }
});