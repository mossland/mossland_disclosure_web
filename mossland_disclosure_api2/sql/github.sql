CREATE TABLE `github` (
  `id` int NOT NULL AUTO_INCREMENT,
  `query_type` varchar(45) NOT NULL,
  `json_value` json NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `query_type_UNIQUE` (`query_type`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;