# CP4 - Query Performance Analysis

## 1. Objective

To analyze the execution performance of the 20 SQL queries created in CP3 using PostgreSQL EXPLAIN ANALYZE.

## 2. Environment

- Database: PostgreSQL 16.13
- Database name: sociofy_cp4
- Dataset: Existing CP2 sample data
- Total queries benchmarked: 20

## 3. Dataset

| Table | Records |
|---|---:|
| student | 3 |
| community | 3 |
| community_membership | 4 |
| event | 2 |
| event_registration | 3 |
| project | 2 |
| project_skill | 7 |
| project_member | 3 |

## 4. Benchmark Methodology

All 20 queries were tested using EXPLAIN ANALYZE.

The benchmark records execution time, planning time, buffer usage, and query execution plans.

## 5. Query Execution Timings

| Query | Execution Time |
|---|---:|
| Q01 | 0.122 ms |
| Q02 | 0.087 ms |
| Q03 | 0.126 ms |
| Q04 | 0.072 ms |
| Q05 | 0.053 ms |
| Q06 | 0.065 ms |
| Q07 | 0.007 ms |
| Q08 | 0.030 ms |
| Q09 | 0.036 ms |
| Q10 | 0.030 ms |
| Q11 | 0.043 ms |
| Q12 | 0.039 ms |
| Q13 | 0.026 ms |
| Q14 | 0.041 ms |
| Q15 | 0.053 ms |
| Q16 | 0.044 ms |
| Q17 | 0.207 ms |
| Q18 | 0.030 ms |
| Q19 | 0.042 ms |
| Q20 | 0.108 ms |

## 6. Execution Plan Analysis

The execution plans contain operations such as Sequential Scan, Index Scan, Hash Join, Hash Aggregate and Sort.

Detailed plans are stored in `plans/all_query_plans.txt`.

The JSON execution plan for Q01 is stored in `plans/q01_student_filter.json`.

## 7. Observations

1. All 20 queries executed successfully.
2. PostgreSQL generated execution plans for all queries.
3. Both sequential scans and index scans were observed.
4. Join, aggregation and sorting operations were observed.
5. Execution times are small because the sample dataset contains very few records.

## 8. Limitations

The dataset is small. Therefore, these timings cannot represent production performance or performance under heavy traffic. PostgreSQL may prefer sequential scans for small tables.

## 9. Conclusion

CP4 successfully benchmarks all 20 CP3 SQL queries using PostgreSQL EXPLAIN ANALYZE. The collected execution plans and timings provide a baseline for understanding query performance and database optimization.
