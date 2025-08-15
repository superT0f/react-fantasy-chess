const { override } = require('customize-cra');
const path = require('path');

module.exports = override((config) => {
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [require('autoprefixer')],
          },
        },
      },
    ],
    include: path.resolve(__dirname, 'src/assets/themes'),
  });
  
  return config;
});