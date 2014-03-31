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

exports.line = new String(multiline(function(){
/*!
#                                    #






     ############################     






     ############################     






     ############################     






#                                    #
*/
return 0;}));
exports.line.tileset = "brick";

exports.swastika = new String(multiline(function(){
/*!
#######     #########                  #
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
exports.swastika.tileset = "brick";

exports.u = new String(multiline(function(){
/*!
#                                    #



     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #     
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #     
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     #                          #
     ############################     



#                                    #
*/
return 0;}));
exports.u.tileset = "brick";

exports.dota = new String(multiline(function(){
/*!
######################################
#                                    #
#                                    #
#        ##############              #
#                                    #
#                                    #
#     ####          #                #
#     #####         #                #
#     ######        #                #
#     #     #                        #
#     #      #                       #
#     #       #     ######           #
#     #        #                     #
#     #         #                    #
#                                    #
#                                    #
#                          #####     #
#                   #          #     #
#                    #         #     #
#                     #        #     #
#           ############             #
#                       #            #
#                        #           #
#                         #          #
#                 ##########         #
#                          ##        #
#                           ##       #
#      #######               ##      #
#                                    #
#                                    #
######################################
*/
return 0;}));
exports.dota.tileset = "brick";

exports.unitTest = new String(multiline(function(){
/*!
###
# #
###
*/
return 0;}));