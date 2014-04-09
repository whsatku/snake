/* jshint expr:true, asi:true */
"use strict";

var multiline = require("multiline");

exports.empty = new String(multiline(function(){
/*!
#                                               #






























#                                               #
*/
return 0;}));
exports.empty.tileset = "brick";

exports.plain = new String(multiline(function(){
/*!
W########     #########     ########W
W                                   W
W                                   W
W                                   W
W                                   W
W                                   W
#                                   #




W                                   W
W                                   W
W                                   W
W                                   W
W                                   W
#                                   #





W                                   W
W                                   W
W                                   W
W                                   W
W                                   W
W                                   W
#########     #########     #########
*/
return 0;}));
exports.plain.tileset = "brick";

exports.line = new String(multiline(function(){
/*!
T                                    T






     ############################     






     ############################     






     ############################     






T                                    T
*/
return 0;}));
exports.line.tileset = "grass";

exports.swastika = new String(multiline(function(){
/*!
#######     #########                  #
#                   #
#                   #
#                   #
#                   #
#                   #
                    #
                    #
                    #
                    #
                    #
#                   #
#                   #
#                   #
#                   #
########################################
                    #                  #
                    #                  #
                    #                  #
                    #                  #
                    #                  #
                    #                   
                    #                   
                    #                   
                    #                   
                    #                   
                    #                  #
                    #                  #
                    #                  #
                    #                  #
#                   ########     #######
*/
return 0;}));
exports.swastika.tileset = "lava";

exports.u = new String(multiline(function(){
/*!
#                                    #



     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W     
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W     
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     W                          W
     ############################     



#                                    #
*/
return 0;}));
exports.u.tileset = "palace";

exports.dota = new String(multiline(function(){
/*!
DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
D                                         D
D                                         D
D                                         D
D           TTTTTTTTTTTTTTTT              D
D                                         D
D                                         D
D                        T                D
D                        T                D
D                        T                D
D        TT######                         D
D        TTTT   ###                       D
D        TT      ###        TTTTTT        D
D        TT       ###                     D
D        TT        ####                   D
D                                         D
D                          TT             D
D                          TTTT           D
D                          T   TT         D
D                    ##    T    TTT       D
D              TT     ##          T   T   D
D              TT     T###         TTT    D
D           TTTTTTTTTTT###                D
D                        ##               D
D                         ##              D
D                         #########       D
D                  TTTTTTTT    ##         D
D             TT                          D
D             TT                          D
D      TTTTTTTTTTTT      TT               D
D                                         D
D                                         D
D                                         D
DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
*/
return 0;}));
exports.dota.tileset = "grass";

exports.unitTest = new String(multiline(function(){
/*!
#D#
# #
###
*/
return 0;}));