CREATE TABLE `wmoc_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `maxSupplyWmoc` varchar(512) NOT NULL,
  `supplyableWmoc` varchar(512) NOT NULL,
  `mocBalance` varchar(512) NOT NULL,
  `mocCirculatingSupply` varchar(512) NOT NULL,
  `wmocLastTx` json NOT NULL,
  `pausedWmoc` tinyint NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `query_type_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21319 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci