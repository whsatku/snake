/* jshint expr:true, asi:true */
"use strict";

var multiline = require("multiline");

exports.plain = new String(multiline(function(){
/*!
#########     #########     #########
#                                   #
#                                   #
#                                   #
#                                   #
#                                   #
#                                   #




#                                   #
#                                   #
#                                   #
#                                   #
#                                   #
#                                   #





#                                   #
#                                   #
#                                   #
#                                   #
#                                   #
#                                   #
#########     #########     #########
*/
return 0;}));
exports.plain.tileset = "brick";

exports.unitTest = new String(multiline(function(){
/*!
###
# #
###
*/
return 0;}));