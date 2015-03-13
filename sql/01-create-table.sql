DROP TABLE IF EXISTS `edge`;

CREATE TABLE `edge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `node_from` int(11) NOT NULL,
  `node_to` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `node`;

CREATE TABLE `node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `source` (
  `id` int(11) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
ALTER TABLE `source`  ADD PRIMARY KEY (`id`), ADD KEY `entity` (`entity`,`entity_id`);
ALTER TABLE `source` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `node` ADD `day` TINYINT NULL AFTER `description`, ADD `month` TINYINT NULL AFTER `day`, ADD `year` SMALLINT NULL AFTER `month`;
