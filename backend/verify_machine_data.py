import sqlite3

conn = sqlite3.connect('smrt.db')
cur = conn.cursor()
print('machines', cur.execute('select count(*) from machines').fetchone()[0])
print('machine_rows', cur.execute('select id, code, name, status, tenant_id from machines order by id limit 10').fetchall())
conn.close()
