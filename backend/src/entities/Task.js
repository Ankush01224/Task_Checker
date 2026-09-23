const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Task',
  tableName: 'tasks',
  columns: {
    id: {
      primary: true,
      type: 'integer',
      generated: true,
    },
    title: {
      type: 'varchar',
      nullable: false,
    },
    description: {
      type: 'varchar',
      nullable: true,
    },
    status: {
      type: 'varchar',
      default: 'pending', // 'pending' | 'completed'
    },
    createdAt: {
      name: 'created_at',
      type: 'datetime',
      createDate: true,
    },
  },
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      inverseSide: 'tasks',
      onDelete: 'CASCADE',
      nullable: false,
    },
  },
});
