(() => ({
  name: 'FilteredDataListCustomQuery',
  icon: 'DataList',
  category: 'DATA',
  structure: [
    {
      name: 'FilteredDataListCustomQuery',
      options: [
        {
          value: '',
          label: 'Model',
          key: 'model',
          type: 'MODEL',
        },
        {
          value: {},
          label: 'Filter',
          key: 'filter',
          type: 'FILTER',
          configuration: {
            dependsOn: 'model',
          },
        },

        {
          key: 'select',
          label: 'Selected properties',
          value: 'id',
          type: 'TEXT',
          configuration: {
            as: 'MULTILINE'
          }
        },
        {
          value: '',
          label: 'Filter statement',
          key: 'customFilterStatementTest',
          type: 'CUSTOM',
          configuration: {
            as: 'MULTILINE',
          }
        },

        {
          key: 'polling',
          type: 'TOGGLE',
          value: false,
          label: 'Auto refresh'
        },
        {
          value: '',
          label: 'Custom filter',
          key: 'customfilter',
          type: 'TEXT'
        },
        {
          value: '',
          label: 'Search on property',
          key: 'searchProperty',
          type: 'PROPERTY',
          configuration: {
            dependsOn: 'model',
          },
        },

        {
          value: '5',
          label: 'Rows per page (max 50)',
          key: 'take',
          type: 'NUMBER',
        },
        {
          value: ['0rem', '0rem', 'M', '0rem'],
          label: 'Outer space',
          key: 'outerSpacing',
          type: 'SIZES',
        },
      ],
      descendants: [],
    },
  ],
}))();
