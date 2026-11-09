const fs = require('fs');
let c = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');
c = c.replace(/`fin_users\/\$\{user\.uid\}\/fin_transactions\/\$\{id\}\n`/g, '`fin_users/${user.uid}/fin_transactions/${id}`');
fs.writeFileSync('src/components/HistoryTab.tsx', c);
