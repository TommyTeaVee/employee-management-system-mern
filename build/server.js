'use strict';

var _express = require('./config/express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

require('babel-polyfill');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const port = process.env.PORT || _config2.default.server.port;
const server = (0, _express2.default)();

_mongoose2.default.Promise = global.Promise;
_mongoose2.default.connect(_config2.default.db.uri, _config2.default.db.options).then(connection => {
    server.listen(port, () => {
        console.log('Express server listening on %d, in %s mode', port, server.get('env'));
    });
}).catch(error => {
    console.log('ERROR:', error);
});;
//# sourceMappingURL=server.js.map