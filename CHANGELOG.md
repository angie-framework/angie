# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

### [0.2.6] - 2015-06-28
#### Added
- Added deep routing (Both RegExp and string matching) to $RouteProvider and BaseRequest. This is configurable with the same  $RouteProvider.prototype.when function as before called with either a RegExp object or a string and a route object with as many nested route objects as desired.

### [0.2.5] - 2015-06-27
#### Added
- Added operators to Model queries. "~" can be used for a "like" query and "<," ">," "=" can all be used alone or in conjunction to make conditional queries

### [0.2.4] - 2015-06-26
#### Added
- Template/Directive parsing support.

### [0.2.3] - 2015-06-10
#### Added
- MySQL and Sqlite3 CRUDdy operation support.
