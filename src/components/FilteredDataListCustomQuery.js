(() => ({
  name: 'FilteredDataListCustomQuery',
  icon: 'DataList',
  category: 'DATA',
  type: 'CONTAINER_COMPONENT',
  allowedTypes: ['BODY_COMPONENT', 'CONTAINER_COMPONENT', 'CONTENT_COMPONENT'],
  orientation: 'HORIZONTAL',
  jsx: (
    <div className={classes.root}>
      {(() => {
        const [page, setPage] = useState(1);
        const [search, setSearch] = useState('');
        const [isTyping, setIsTyping] = useState(false);

        const take = parseInt(options.take, 10) || 50;
        const searchProp = B.getProperty(options.searchProperty);

        const isEmpty = children.length === 0;
        const isDev = B.env === 'dev';
        const isPristine = isEmpty && isDev;

        const { gql } = window;
        const { Query, env, getModel, __SECRET_CONTEXT_DO_NOT_USE } = B;

        const [filterState, setFilterState] = isDev ? useState({}) : useContext(__SECRET_CONTEXT_DO_NOT_USE);

        /* Layouts */

        const builderLayout = () => (
          <>
            {options.searchProperty && (
              <div className={classes.header}>
                <Search
                  name={B.env === 'dev' ? '[property]' : searchProp.name}
                  search={search}
                />
              </div>
            )}
            <div
              className={[
                isEmpty ? classes.empty : '',
                isPristine ? classes.pristine : '',
              ].join(' ')}
            >
              {isPristine ? 'Data List' : children}
            </div>
            <div className={classes.footer}>
              {(isDev || options.model) && (
                <Pagination totalCount={0} resultCount={take} currentPage={1} />
              )}
            </div>
          </>
        );

        const canvasLayout = () => {
          if (!options.model) {
            return builderLayout();
          }

          let where = {};

          if (searchProp && search !== '') {
            where[searchProp.name] = {
              ...(where[searchProp.name] ? where[searchProp.name] : {}),
              regex: search,
            };
          }

          if (options.customfilter) {
            const params = useParams();
            where = JSON.parse(Mustache.render(options.customfilter, params));
          }

          const m = getModel(options.model);

          const queryKey = 'all' + m.name;

          const q =
            'query ($skip: Int, $take: Int) {\
            ' +
            queryKey +
            '(skip: $skip, take: $take, where: $where) {\
                results {\
                  ' +
            options.select +
            '\
                }\
                totalCount\
            }\
          }';
          if (options.filter) {
            where = B.useFilter(options.filter);
          }

          if(filterState && filterState.filterState) {
            eval(options.customFilterStatementTest)
            // if(filterState.filterState.regionid) {
            //   where = {...where, region: {id: {eq: filterState.filterState.regionid}}}
            // }
            //
            // if(filterState.filterState.languageid) {
            //   where = {...where, language: {id: {eq: filterState.filterState.languageid}}}
            // }
            //
            // if(filterState.filterState.countryid) {
            //   where = {...where, country: {id: {eq: filterState.filterState.countryid}}}
            // }
            //
            // if(filterState.filterState.standardid) {
            //   where = {...where, id: {eq: filterState.filterState.standardid}}
            // }
            //
            // if(filterState.filterState.classcode) {
            //   where = {...where, classes: {code: {eq: filterState.filterState.classcode}}}
            // }

          }



          const g = gql(q);

          return (
            <Query
              query={g}
              variables={{
                where: where,
                skip: page ? (page - 1) * take : 0,
                take: take,
              }}
              pollInterval={options.polling ? 1500 : 0}
            >
              {({ loading, error, data }) => {
                if (loading) return 'loading...';
                if (error) return 'failed';
                return (
                  <>
                    <div className={classes.header}>
                      {searchProp && (
                        <Search
                          name={searchProp.name}
                          search={search}
                          isTyping={isTyping}
                          setSearch={setSearch}
                          setIsTyping={setIsTyping}
                        />
                      )}
                    </div>
                    <section
                      className={[
                        classes.row,
                        isEmpty ? classes.empty : '',
                        isPristine ? classes.pristine : '',
                      ].join(' ')}
                    >
                      {data[queryKey].results.map(item => (
                        <B.GetOneProvider key={item.id} value={item}>
                          {children}
                        </B.GetOneProvider>
                      ))}
                    </section>
                    <div className={classes.footer}>
                      {!isEmpty && (
                        <Pagination
                          totalCount={data[queryKey].totalCount}
                          resultCount={data[queryKey].results.length}
                          currentPage={page}
                        />
                      )}
                    </div>
                  </>
                );
              }}
            </Query>
          );
        };

        /* SubComponents */

        // eslint-disable-next-line no-shadow
        function Search({ name, search, isTyping, setIsTyping }) {
          const inputRef = React.createRef();

          React.useEffect(() => {
            if (isTyping) {
              inputRef.current.focus();
            }
          });

          return (
            <div className={classes.searchWrapper}>
              <i
                className={[classes.searchIcon, 'zmdi zmdi-search'].join(' ')}
              />
              <input
                className={classes.search}
                type="text"
                value={search}
                onChange={({ target: { value } }) => setSearch(value)}
                ref={inputRef}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder={`Search on ${name}`}
              />
            </div>
          );
        }

        function Pagination({ totalCount, resultCount, currentPage }) {
          const firstItem = currentPage ? (currentPage - 1) * take : 0;

          useEffect(() => {
            const totalPages = Math.ceil(totalCount / take);

            if (currentPage > totalPages) {
              setPage(totalPages);
            }
          }, [totalCount]);

          const totalText = B.env === 'dev' ? '[total]' : totalCount;

          return (
            <>
              <span>
                {firstItem + 1}
                {firstItem + 1 !== totalCount &&
                  ` - ${firstItem + resultCount}`}{' '}
                of {totalText}
              </span>
              <div className={classes.pagination}>
                {typeof currentPage !== 'undefined' && currentPage > 1 ? (
                  <button
                    className={classes.button}
                    type="button"
                    onClick={() => setPage(v => v - 1)}
                  >
                    <span
                      className={[classes.arrow, 'zmdi zmdi-chevron-left'].join(
                        ' ',
                      )}
                    />
                  </button>
                ) : (
                  <span
                    className={[
                      classes.arrow,
                      classes.arrowDisabled,
                      'zmdi zmdi-chevron-left',
                    ].join(' ')}
                  />
                )}
                {(typeof currentPage === 'undefined' ? 1 : currentPage) <
                totalCount / take ? (
                  <button
                    className={classes.button}
                    type="button"
                    onClick={() => setPage(v => v + 1)}
                  >
                    <span
                      className={[
                        classes.arrow,
                        'zmdi zmdi-chevron-right',
                      ].join(' ')}
                    />
                  </button>
                ) : (
                  <span
                    className={[
                      classes.arrow,
                      classes.arrowDisabled,
                      'zmdi zmdi-chevron-right',
                    ].join(' ')}
                  />
                )}
              </div>
            </>
          );
        }

        return isDev ? builderLayout() : canvasLayout();
      })()}
    </div>
  ),
  styles: B => theme => {
    const style = new B.Styling(theme);
    const getSpacing = (idx, device = 'Mobile') =>
      idx === '0' ? '0rem' : style.getSpacing(idx, device);

    return {
      root: {
        width: '100%',
        marginTop: ({ options: { outerSpacing } }) =>
          getSpacing(outerSpacing[0]),
        marginRight: ({ options: { outerSpacing } }) =>
          getSpacing(outerSpacing[1]),
        marginBottom: ({ options: { outerSpacing } }) =>
          getSpacing(outerSpacing[2]),
        marginLeft: ({ options: { outerSpacing } }) =>
          getSpacing(outerSpacing[3]),
      },
      row: {
        display: 'flex',
        height: '100%',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row-reverse',
        width: '100%',
      },
      searchWrapper: {
        display: 'flex',
        alignItems: 'center',
        padding: [0, '0.5rem'],
        borderBottom: [1, 'solid', '#000'],
        minHeight: '4rem',
      },
      searchIcon: {
        fontSize: '1.25rem',
        marginRight: '1rem',
      },
      search: {
        padding: ['0.25rem', 0],
        fontSize: '1rem',
        border: 'none',
        outline: 'none',
      },
      button: {
        background: 'transparent',
        border: 'none',
        display: 'inline-block',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        '&:active': {
          outline: 'none',
        },
      },
      footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: ['0.75rem', 0],
      },
      placeholder: {
        opacity: '0.4',
      },
      pagination: {
        marginLeft: '1rem',
      },
      arrow: {
        padding: '1rem',
        fontSize: '1.625rem',
        color: '#000',
        textDecoration: 'none',
      },
      arrowDisabled: { color: '#ccc' },
      [`@media ${B.mediaMinWidth(768)}`]: {
        root: {
          marginTop: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[0], 'Portrait'),
          marginRight: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[1], 'Portrait'),
          marginBottom: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[2], 'Portrait'),
          marginLeft: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[3], 'Portrait'),
        },
      },
      [`@media ${B.mediaMinWidth(1024)}`]: {
        root: {
          marginTop: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[0], 'Landscape'),
          marginRight: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[1], 'Landscape'),
          marginBottom: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[2], 'Landscape'),
          marginLeft: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[3], 'Landscape'),
        },
      },
      [`@media ${B.mediaMinWidth(1200)}`]: {
        root: {
          marginTop: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[0], 'Desktop'),
          marginRight: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[1], 'Desktop'),
          marginBottom: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[2], 'Desktop'),
          marginLeft: ({ options: { outerSpacing } }) =>
            getSpacing(outerSpacing[3], 'Desktop'),
        },
      },
      empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '4rem',
        height: '100%',
        width: '100%',
        fontSize: '0.75rem',
        color: '#262A3A',
        textTransform: 'uppercase',
        boxSizing: 'border-box',
      },
      pristine: {
        borderWidth: '0.0625rem',
        borderColor: '#AFB5C8',
        borderStyle: 'dashed',
        backgroundColor: '#F0F1F5',
      },
    };
  },
}))();
