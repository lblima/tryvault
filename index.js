const lineReader = require('line-reader');
const fs = require('fs');

const customer = {};
const MAX_PER_DAY = 5000;
const MAX_PER_WEEK = 20000;
const MAX_LOADS_PER_DAY = 3;
const RESULT_PATH = 'output2.txt';

if (fs.existsSync(RESULT_PATH)) {
  fs.unlinkSync(RESULT_PATH);
}

lineReader.eachLine('input.txt', function(line) {
  const load = JSON.parse(line);

  if (!customer[load.customer_id]?.load_ids.includes(load.id)) {
    const loadAmount = parseFloat(load.load_amount.replace('$', ''));
    const totalLoadAmountDay = customer[load.customer_id]?.total_load_amount_day || 0;
    const totalLoadAmountWeek = customer[load.customer_id]?.total_load_amount_week || 0;
    const totalLoadsOnDay = customer[load.customer_id]?.loads_on_day || 0;
    const lastLoadTime = customer[load.customer_id]?.load_time;

    let formatedCurrentLoadDate;
    let formatedLastLoadDate;
    let isSameDay = false;
    let isSameWeek = false;
    let accepted = false;

    if (lastLoadTime) {
      const lastLoadDate = new Date(lastLoadTime);
      const currentLoadDate = new Date(load.time);
      const currentLoadDateInitalTime = new Date(currentLoadDate.getUTCFullYear(), currentLoadDate.getUTCMonth(), currentLoadDate.getUTCDate());
      const thisMonday = new Date(currentLoadDateInitalTime.setDate(currentLoadDateInitalTime.getDate() - currentLoadDateInitalTime.getDay() + 1));
      const nextMonday = new Date(currentLoadDateInitalTime.setDate(currentLoadDateInitalTime.getDate() - currentLoadDateInitalTime.getDay() + 8));

      formatedLastLoadDate = `${lastLoadDate.getUTCFullYear()}/${lastLoadDate.getUTCMonth()+1}/${lastLoadDate.getUTCDate()}`;
      formatedCurrentLoadDate = `${currentLoadDate.getUTCFullYear()}/${currentLoadDate.getUTCMonth()+1}/${currentLoadDate.getUTCDate()}`;
      isSameDay = formatedLastLoadDate === formatedCurrentLoadDate;

      if (lastLoadDate >= thisMonday && currentLoadDate < nextMonday) {
        isSameWeek = true;
      }
    }

    const loadsOnDay = isSameDay ? totalLoadsOnDay + 1 : 1;
    const totalAmountOnDay = isSameDay ? totalLoadAmountDay + loadAmount : loadAmount;
    const totalAmountOnWeek = isSameWeek ? totalLoadAmountWeek + loadAmount : loadAmount;

    if (customer[load.customer_id]) {
      customer[load.customer_id].load_ids = [...customer[load.customer_id].load_ids, load.id];
      customer[load.customer_id].load_amount = loadAmount;
      customer[load.customer_id].load_time = load.time;
      customer[load.customer_id].total_load_amount_day = totalAmountOnDay;
      customer[load.customer_id].total_load_amount_week = totalAmountOnWeek;
      customer[load.customer_id].loads_on_day = loadsOnDay;
      customer[load.customer_id].rejected = false;
    } else {
      customer[load.customer_id] = {
        load_ids: [load.id],
        load_amount: loadAmount,
        load_time: load.time,
        total_load_amount_day: totalAmountOnDay,
        total_load_amount_week: totalAmountOnWeek,
        loads_on_day: loadsOnDay,
        rejected: false
      }
    }
    
    if (customer[load.customer_id].total_load_amount_day <= MAX_PER_DAY && 
        customer[load.customer_id].loads_on_day <= MAX_LOADS_PER_DAY &&
        customer[load.customer_id].total_load_amount_week <= MAX_PER_WEEK) {
          accepted = true;
    }
    else {
      customer[load.customer_id].rejected = true;
      customer[load.customer_id].total_load_amount_day = totalAmountOnDay - loadAmount;
      customer[load.customer_id].total_load_amount_week = totalAmountOnWeek - loadAmount;
    }

    const result = `${JSON.stringify({
      id: load.id,
      customer_id: load.customer_id,
      accepted,
    })}\n`;

    fs.appendFileSync('output3.txt', result);
  }
});