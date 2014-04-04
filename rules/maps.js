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
DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
D                                    D
D                                    D
D        TTTTTTTTTTTTTT              D
D                                    D
D                                    D
D     TTT#          T                D
D     TTT##         T                D
D     TTTT##        T                D
D     T     #                        D
D     T      #                       D
D     T       #     TTTTTT           D
D     T        #                     D
D     T         #                    D
D                                    D
D                                    D
D                          TTTTT     D
D                   #          T     D
D                    #         T     D
D                    ##        T     D
D           TTTTTTTTTTT#             D
D                       #            D
D                        #           D
D                        ##          D
D                 TTTTTTTTT#         D
D                          ##        D
D                           ##       D
D      TTTTTTT               ##      D
D                                    D
D                                    D
DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
*/
return 0;}));
exports.dota.tileset = "grass";

exports.unitTest = new String(multiline(function(){
/*!
###
# #
###
*/
return 0;}));