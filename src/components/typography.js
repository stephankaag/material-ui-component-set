(() => ({
  name: 'Typography',
  type: 'CONTENT_COMPONENT',
  allowedTypes: [],
  orientation: 'HORIZONTAL',
  jsx: (() => {
    const { Typography } = window.MaterialUI.Core;
    const { env } = B;
    const { variant, text, gutterBottom, display, align, color } = options;
    const isDev = B.env === 'dev';
    const val =
      B.GetOneProvider && B.GetOneProvider._context
        ? useContext(B.GetOneProvider._context)
        : {};
    const mustache_vars = {
      ...val,
    };
    const jsontext =
      options.jsontext && val && B.env === 'prod'
        ? Mustache.render(options.jsontext, mustache_vars)
        : '';
    const typography = (
      <Typography
        align={align}
        variant={variant}
        gutterBottom={gutterBottom}
        display={display}
        color={color}
        component={options.compo}
      >
        <B.Text value={text} />
        {env === 'dev' ? options.jsontext : jsontext}
      </Typography>
    );
    return isDev ? <span>{typography}</span> : typography;
  })(),
  styles: () => () => ({}),
}))();
