/**
 * P2 (2026-10-13): the top 20 terms on this site that match a Data Lakehouse Hub
 * glossary entry. Each matched term page shows a "See also on the Data Lakehouse
 * Hub glossary" link. The same pairs are recorded in
 * docs-and-audits/network-performance-audit-2026-10-13/status/small-sites.md so the
 * Hub can link back. Every URL was checked for HTTP 200 on 2026-10-13.
 */
export const hubGlossary: Record<string, { url: string; title: string }> = {
  'data-lakehouse': { url: 'https://datalakehousehub.com/knowledgebase/data-lakehouse/', title: "What is Data Lakehouse?" },
  'data-lake': { url: 'https://datalakehousehub.com/knowledgebase/data-lake/', title: "What is a Data Lake?" },
  'data-lakehouse-architecture': { url: 'https://datalakehousehub.com/knowledgebase/data-lakehouse-architecture/', title: "What is Data Lakehouse Architecture?" },
  'open-table-formats': { url: 'https://datalakehousehub.com/knowledgebase/open-table-format/', title: "What is Open Table Format?" },
  'apache-parquet': { url: 'https://datalakehousehub.com/knowledgebase/apache-parquet/', title: "What is Apache Parquet?" },
  'apache-arrow': { url: 'https://datalakehousehub.com/knowledgebase/apache-arrow/', title: "What is Apache Arrow?" },
  'apache-polaris': { url: 'https://datalakehousehub.com/knowledgebase/apache-polaris/', title: "What is Apache Polaris?" },
  'apache-spark': { url: 'https://datalakehousehub.com/knowledgebase/apache-spark/', title: "What is Apache Spark?" },
  'apache-airflow': { url: 'https://datalakehousehub.com/knowledgebase/apache-airflow/', title: "What is Apache Airflow?" },
  'apache-kafka': { url: 'https://datalakehousehub.com/knowledgebase/apache-kafka/', title: "What is Apache Kafka?" },
  'delta-lake': { url: 'https://datalakehousehub.com/knowledgebase/delta-lake/', title: "What is Delta Lake?" },
  'apache-hudi': { url: 'https://datalakehousehub.com/knowledgebase/apache-hudi/', title: "What is Apache Hudi?" },
  'semantic-layer': { url: 'https://datalakehousehub.com/knowledgebase/semantic-layer/', title: "What is a Semantic Layer?" },
  'etl': { url: 'https://datalakehousehub.com/knowledgebase/etl/', title: "What is ETL?" },
  'elt': { url: 'https://datalakehousehub.com/knowledgebase/elt/', title: "What is ELT?" },
  'change-data-capture': { url: 'https://datalakehousehub.com/knowledgebase/change-data-capture/', title: "What is Change Data Capture (CDC)?" },
  'data-catalog': { url: 'https://datalakehousehub.com/knowledgebase/data-catalog/', title: "What is a Data Catalog?" },
  'medallion-architecture': { url: 'https://datalakehousehub.com/knowledgebase/medallion-architecture/', title: "What is the Medallion Architecture?" },
  'schema-evolution': { url: 'https://datalakehousehub.com/knowledgebase/schema-evolution/', title: "What is Schema Evolution?" },
  'data-governance': { url: 'https://datalakehousehub.com/knowledgebase/data-governance/', title: "What is Data Governance?" },
};
