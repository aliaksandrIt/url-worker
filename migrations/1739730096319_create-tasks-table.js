/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('tasks', {
      id: {
        type: 'serial',
        primaryKey: true
      },
      url: {
        type: 'text',
        notNull: true
      },
      status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'NEW'
      },
      http_code: {
        type: 'int',
        notNull: false
      }
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable('tasks');
  };
  