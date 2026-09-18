const https = require('https');

https.get('https://api.github.com/repos/gamerboy-hardik/Darukka-Earth/actions/runs?per_page=1', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data);
    const runId = runs.workflow_runs[0].id;
    https.get(`https://api.github.com/repos/gamerboy-hardik/Darukka-Earth/actions/runs/${runId}/jobs`, {
      headers: { 'User-Agent': 'Node.js' }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        const jobs = JSON.parse(data2);
        const job = jobs.jobs.find(j => j.name === 'test-and-lint');
        if (job) {
          https.get(`https://api.github.com/repos/gamerboy-hardik/Darukka-Earth/actions/jobs/${job.id}/logs`, {
            headers: { 'User-Agent': 'Node.js' }
          }, (res3) => {
            if (res3.statusCode === 302) {
              https.get(res3.headers.location, (res4) => {
                let data4 = '';
                res4.on('data', chunk => data4 += chunk);
                res4.on('end', () => console.log(data4.substring(data4.length - 4000)));
              });
            }
          });
        }
      });
    });
  });
});
