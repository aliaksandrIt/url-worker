/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO tasks (url, status, http_code)
    VALUES
      ('https://google.com/', 'NEW', null),
      ('https://reddit.com/', 'NEW', null),
      ('https://example.com/', 'NEW', null);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM tasks
    WHERE url IN ('https://google.com/', 'https://reddit.com/', 'https://example.com/');
  `);
};
