CREATE TABLE biketypes
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
)

CREATE TABLE bikes
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    biketypeId INTEGER,
    FOREIGN KEY (biketypeId) REFERENCES biketypes (id) ON DELETE CASCADE,
    price INTEGER
)

CREATE TABLE rentals
(
    id SERIAL PRIMARY KEY,
    rented_on TIMESTAMP,
    returned_on TIMESTAMP NULL,
    bikeId INTEGER,
    FOREIGN KEY (bikeId) REFERENCES bikes(id) ON DELETE CASCADE
)