<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<!-- The main page template -->
<html>

<!-- Mirrored from controller.access.network/101/portal/ by HTTrack Website Copier/3.x [XR&CO'2013], Mon, 24 Jun 2019 12:13:13 GMT -->
<!-- Added by HTTrack -->
<meta http-equiv="content-type" content="text/html;charset=UTF-8"/><!-- /Added by HTTrack -->
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <title>Portal</title>
    <!-- Internal resources --><!-- Javascript resources --><!-- JQuery api must always be first -->
    <script type="text/javascript" language="javascript"
            src="resources/_javascript/jquery-1.5.2.minfef7.js?1530113452"></script>
    <script type="text/javascript" language="javascript"
            src="resources/_javascript/jquery.sprintffef7.js?1530113452"></script>
    <script type="text/javascript" language="javascript"
            src="resources/_javascript/calendar/calendarfef7.js?1530113452"></script>
    <script type="text/javascript" language="javascript" src="portalfef7.js?1530113452"></script><!-- CSS -->
    <link type="text/css" rel="stylesheet" href="portalfef7.css?1530113452">
    <link type="text/css" rel="stylesheet" href="resources/_css/calendar-mosfef7.css?1530113452">
    <!--[if lt IE 9]>
    <style>
        #reserved_block div.logonSquareBox {
            background-position: 0px -200px; /*specific to IE < 9 to display login icon correctly*/
        }
    </style>
    <![endif]--><!-- External resources -->
    <script type="text/javascript" language="javascript"
            src="../../javascript/jquery.portal_apifef7.js?1530113452"></script>
</head>
<body>
<!-- Body content -->
<div id="container">
    <!-- Will receive Header, Body, Footer and custom blocks ... -->
    <div id="header">
        <!-- The header template -->
        <!-- Will be added on top of the page -->
        &nbsp;
    </div>
    <div id="body">
        <div>&nbsp;</div>
        <!-- The body background template -->
        <!-- Will be added on the center of the page -->
        <div id="lang_block" dir="ltr">
            <!-- Languages block -->
            <!-- Must not be modified -->
            <a id="lang_link[fr]" href="#"><img src="resources/_images/flags/fr.png" title="Fran&ccedil;ais"></a>
            <a id="lang_link[de]" href="#"><img src="resources/_images/flags/de.png" title="Deutsch"></a>
            <a id="lang_link[en]" href="#"><img src="resources/_images/flags/en.png" title="English"></a>
            <a id="lang_link[es]" href="#"><img src="resources/_images/flags/es.png" title="Espa&ntilde;ol"></a>
            <a id="lang_link[it]" href="#"><img src="resources/_images/flags/it.png" title="Italiano"></a>
            <a id="lang_link[pt]" href="#"><img src="resources/_images/flags/pt.png" title="Portugu&ecirc;s"></a>
        </div>
        <div>
            <div id="reserved_block">
                <!-- The Reserved Block -->
                <div id="error_info_block">
                    <!-- Error Info Block -->
                    <span id="error_info_value">&nbsp;</span>
                </div>
                <div id="waiting_icon_block" style="display:none">
                    <img src="resources/_images/loader.gif">
                </div>
                <form action="test.php" method="post">
                    <!-- Secure Portal Password form (Visible status depends on configuration option) -->
                    <div class="title">
                        <span id="securePwdForm_title_text">Identification</span>
                    </div>
                    <div class="explain"></div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="logonForm_login_field">
                            <td>
                                <span id="logonForm_login_text" class="label">Identifiant</span>
                            </td>
                            <td>
                                <input type="text" name="login" autocomplete="on">
                            </td>
                        </tr>
                        <tr>
                            <td class="label">
                                <span id="securePwdForm_secure_pwd_text">Mot de passe</span>
                            </td>
                            <td>
                                <input type="password" name="secure_pwd">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="1">
                                &nbsp;
                            </td>
                            <td id="logonFormConnectionLink">
                                <button type="submit" value="Connexion" onclick="test.php">Connexion</button>
                            </td>

                        </tr>
                    </table>
                </form>
                <div id="forceModifyPwdErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="forceModifyPwdErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="forceModifyPwdErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="forceModifyPwdForm" style="display:none">
                    <!-- Force Modify Password Form -->
                    <div class="title">
                        <span id="forceModifyPwdForm_title_text">Forced password change</span>
                    </div>
                    <div class="explain">
                        <span id="forceModifyPwdForm_explain_text">You must change your password in order to continue.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td>
                                <span id="forceModifyPwdForm_old_pwd_text" class="label">Current password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="old_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span id="forceModifyPwdForm_new_pwd_text" class="label">New password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="new_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span id="forceModifyPwdForm_confirm_pwd_text" class="label">Confirm new password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="confirm_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr id="forceModifyPwdForm_help_tr" style="display:none">
                            <td colspan="2" class="field-state">
                                <span id="forceModifyPwdForm_help_link" class="helper">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="forceModifyPwdForm_help_block" class="phone-help" style="display:none">
                            <!-- Display help to show the profile password constraint -->
                            <td colspan="2">
                                <table>
                                    <tr>
                                        <td style="width: 20%;">
                                            &nbsp;
                                        </td>
                                        <td style="width: 80%;">
                                            <div style="text-align: left">
                                                <span id="forceModifyPwdHelpBlock_text">Your password has to be follow those rules:</span>
                                                <ul id="forceModifyPwdForm_help_list">
                                                    <li style="display:none">
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="field-state">
                                <span id="forceModifyPwdForm_fields_state_text"
                                      class="field-state">* Mandatory fields</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="forceModifyPwdForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="forceModifyPwdForm_confirm_button">Confirm</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="logonForm" style="display: none;">
                    <!-- Logon Form -->
                    <div class="title">
                        <span id="logonForm_title_text">Sign In</span>
                    </div>
                    <div class="explain">
                        <span id="logonForm_explain_text">If you don't have a login, you could register by the link below.</span>
                    </div>
                    <div class="h-separator"></div>

                    <div id="logonForm_auth_modes_block" style="display:none">
                        <div id="logonForm_shibboleth_authentication_button" class="hoverLink">
                            <table>
                                <tr>
                                    <td>
                                        <img src="resources/_images/shibboleth.png">
                                    </td>
                                    <td>
                                        <span id="logonForm_shibboleth_text">Use your institutional credentials</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div id="logonForm_standard_authentication_button" class="hoverLink">
                            <table>
                                <tr>
                                    <td>
                                        <img src="resources/_images/ticket.png">
                                    </td>
                                    <td>
                                        <span id="logonForm_ticket_text">Use a connection ticket</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <table class="auth_form" id="logonForm_standard_auth_form" style="display: table;">
                        <tr id="logonForm_wispr_operator_field" class="logonForm_wispr_elements">
                            <td>
                                <span id="logonForm_wispr_operator_text" class="label">Provider</span>
                            </td>
                            <td>
                                <select id="user_wispr_operator" name="user_wispr_operator">
                                    <option value="" selected id="user_wispr_operator_not_specified_text">Not
                                        specified
                                    </option>
                                </select>
                            </td>
                        </tr>
                        <tr id="logonForm_password_field">
                            <td>
                                <span id="logonForm_password_text" class="label">Password</span>
                            </td>
                            <td>
                                <input type="password" name="password" autocomplete="on">
                            </td>
                        </tr>
                        <tr id="logonForm_forgotPasswordLink" style="display:none">
                            <td colspan="2">
                                <a id="logonForm_forgotPasswordLink_link" href="#"><span
                                        id="logonForm_forgotPasswordLink_text">Forgot password?</span></a>
                            </td>
                        </tr>
                        <tr id="logonForm_accountRefillLink" style="display:none">
                            <td colspan="2">
                                <a id="logonForm_accountRefillLink_link" href="#"><span
                                        id="logonForm_accountRefillLink_text">Add options to your account</span></a>
                            </td>
                        </tr>
                        <tr id="logonForm_policy_block">
                            <!-- Check Box Confirm (Visible status depends on configuration option) -->
                            <td colspan="2">
                                <br><input type="checkbox" name="policy_accept">&nbsp;
                                <span id="logonForm_policy_text"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                    </table>
                    <div class="logonForm_wispr_elements" style="display: none; margin-top: 1em;">
                        <input type="checkbox" name="wispr_mode" style="display: none;">
                        <div class="center">
                            <button type="button" id="logonFormWispr_back_button" onclick="showWisprConnect(false);">
                                Back
                            </button>
                        </div>
                    </div>
                    <div class="logonForm_classic_elements">
                        <table id="twitterFollow" style="display: none;">
                            <tr>
                                <td colspan="2">
                                    <br><input type="checkbox" name="twitter_follow">&nbsp;
                                    <span id="logonForm_twitter_follow_text">Follow Twitter account</span><span
                                        id="logonForm_twitter_follow_auto_screen_name"></span>
                                </td>
                            </tr>
                        </table>
                        <table id="facebookLike" style="display: none;">
                            <tr>
                                <td colspan="2">
                                    <br><input type="checkbox" name="facebook_like">&nbsp;
                                    <span id="logonForm_facebook_like_text">Publish a Facebook Like on </span><span
                                        id="logonForm_facebook_like_url"></span>
                                </td>
                            </tr>
                        </table>
                        <div id="logonForm_socialNetworkChoice_grid" style="display:none">
                            <div id="facebookLink" class="smallBox facebookSmallBox"
                                 title="Use your Facebook credentials" style="display:none"></div>
                            <div id="googleLink" class="smallBox googleSmallBox" title="Use your Google credentials"
                                 style="display:none"></div>
                            <div id="linkedinLink" class="smallBox linkedinSmallBox"
                                 title="Use your LinkedIn credentials" style="display:none"></div>
                            <div id="twitterLink" class="smallBox twitterSmallBox" title="Use your Twitter credentials"
                                 style="display:none"></div>
                        </div>
                        <div id="logonForm_socialNetworkChoice_openid_grid" style="display:none">
                        </div>
                        <div id="logonForm_wispr_grid" style="display: none;">
                            <div class="wisprDiv hoverLink" id="wisprLink" title="Use your WiFi provider credentials"
                                 onclick="showWisprConnect(true);">
                                <div class="wisprSmallBox"></div>
                                <span id="logonForm_wispr_text" class="wisprSpan">WiFi provider</span>
                            </div>
                        </div>
                    </div>
                    <div id="logonForm_privatePolicy_dialog" class="modal">
                        <!-- Private policy modal window (Will be displayed for social networks private policy acceptance) -->
                        <div class="modal-content">
                            <div class="modal-body">
                                <span class="close" id="logonForm_privatePolicy_cross_span">&times;</span>
                                <br>
                                <p>
                                    <input type="checkbox" id="logonForm_privatePolicy_accept">&nbsp;
                                    <span id="logonForm_privatePolicy_facebook_text"></span>
                                    <span id="logonForm_privatePolicy_google_text"></span>
                                    <span id="logonForm_privatePolicy_linkedin_text"></span>
                                    <span id="logonForm_privatePolicy_twitter_text"></span>
                                </p>
                                <br>
                            </div>
                            <div class="modal-footer">
                                <h3>
                                    <button type="button" id="logonForm_privatePolicy_back_button">Back</button>
                                    <button type="button" id="logonForm_privatePolicy_connect_button">Connection
                                    </button>
                                </h3>
                            </div>
                        </div>
                    </div>
                </form>
                <div id="subscriptionChoice" style="display:none">
                    <!-- Subscription Choice block (Will be displayed only if more than one subscription mode are configured )-->
                    <div class="title">
                        <span id="subscriptionChoice_title_text">Register choice</span>
                    </div>
                    <div class="explain">
                        <span id="subscriptionChoice_explain_text">Please choose the register mode you want to use by clicking on it.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="subscriptionChoiceInsert"></div>
                    <br>
                    <div class="center">
                        <button type="button" id="logonFormSubscriptionLink_back_button">Back</button>
                    </div>
                </div>
                <form name="feedbackForm" style="display:none">
                    <!-- Feedback Form-->
                    <table cellpadding="0" cellspacing="0">
                        <tr id="feedbackForm_pms_customer_block" style="display:none">
                            <!-- PMS Display (Shows only if PMS) -->
                            <td colspan="2">
                                <span id="feedbackForm_pms_customer_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_pms_message_block" style="display:none">
                            <!-- PMS Display (Shows only if PMS) -->
                            <td colspan="2">
                                <span id="feedbackForm_pms_message_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_caution_block" class="caution" style="display:none">
                            <td colspan="2">
                                <span id="feedbackForm_caution_text">CAUTION: closing this window will disconnect you.</span>
                                <span id="feedbackForm_caution_oob_text">Warning: to avoid wasting time-credit, you have to use the logout button, or disconnect your device from the network at the end of your session.</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_requested_url_block" style="display:none">
                            <td colspan="2">
                                <br>
                                <p><a id="feedbackForm_requested_url_link" href="#" target="_blank"><span
                                        id="feedbackForm_requested_url_text">Click here to access to the requested page</span></a>
                                </p>
                                <p>
                                    <br></p>
                            </td>
                        </tr>
                        <tr id="feedbackForm_postConnectRedirectDelay_block" style="display:none">
                            <td colspan="2">
                                <p><span id="feedbackForm_postConnectRedirectDelay_text"></span></p>
                                <br>
                            </td>
                        </tr>
                        <tr id="feedbackForm_login_block" style="display:none">
                            <!-- User Id (Shows only if no PPS) -->
                            <td class="label">
                                <span id="feedbackForm_login_text">Login</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_login_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_profile_block">
                            <td class="label">
                                <span id="feedbackForm_profile_text">Profile</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_profile_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_package_block" style="display:none">
                            <!-- Package (PMS/Paypal) (Shows only if needed) -->
                            <td class="label">
                                <span id="feedbackForm_package_text">Package</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_package_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_services_block">
                            <td class="label">
                                <span id="feedbackForm_services_text">Services</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_services_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_ip_address_block">
                            <td class="label">
                                <span id="feedbackForm_ip_address_text">IP Address</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_ip_address_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_incoming_network_block">
                            <td class="label">
                                <span id="feedbackForm_incoming_network_text">Incoming network</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_incoming_network_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_incoming_zone_block">
                            <td class="label">
                                <span id="feedbackForm_incoming_zone_text">Incoming Zone</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_incoming_zone_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_multidevice_block">
                            <td class="label">
                                <span id="feedbackForm_multidevice_text">Additional connections</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_multidevice_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_schedule_block">
                            <!-- User Schedule -->
                            <td class="label">
                                <span id="feedbackForm_schedule_text">Schedule</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_schedule_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_validity_block">
                            <!-- User Validity -->
                            <td class="label">
                                <span id="feedbackForm_validity_text">Validity</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_validity_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_time_credit_block">
                            <!-- User time credit with renew settings -->
                            <td class="label">
                                <span id="feedbackForm_time_credit_text">Time Credit</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_time_credit_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_remaining_time_credit_block">
                            <!-- User remaining time credit -->
                            <td class="label">
                                <span id="feedbackForm_remaining_time_credit_text">Remaining Time Credit</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_remaining_time_credit_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_automatic_disconnection_block">
                            <!-- User remainging time before forced disconnection -->
                            <td class="label">
                                <span id="feedbackForm_automatic_disconnection_text">Automatic disconnection in</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_automatic_disconnection_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_pps_total_time_credit_block" style="display:none">
                            <!-- User total time credit (Shows only if PPS) -->
                            <td class="label">
                                <span id="feedbackForm_pps_total_time_credit_text">Total Time</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_pps_total_time_credit_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_pps_total_consumed_time_credit_block" style="display:none">
                            <!-- User total consumed time credit (Shows only if PPS) -->
                            <td class="label">
                                <span id="feedbackForm_pps_total_consumed_time_credit_text">Consumed Time</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_pps_total_consumed_time_credit_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_quota_total_consumed_data_block" style="display:none">
                            <!-- User consumed data since -->
                            <td class="label">
                                <span id="feedbackForm_quota_total_consumed_data_text">Consumed data</span>
                            </td>
                            <td class="feedback">
                                <span id="feedbackForm_quota_total_consumed_data_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="feedbackForm_settings_link">
                            <td colspan="2"></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="submit" id="feedbackForm_disconnect_button">Disconnect</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="modifyPwdLink" style="display:none">
                    <!-- Link to access to Modify Password Form -->
                    <a id="modifyPwdLink_link" href="#"><span id="modifyPwdLink_text">Modify your password</span></a>
                </div>
                <div id="modifyPwdErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="modifyPwdErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="modifyPwdErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="modifyPwdForm" style="display:none">
                    <!-- Modify Password Form -->
                    <div class="title">
                        <span id="modifyPwdForm_title_text">Password change</span>
                    </div>
                    <div class="explain">
                        <span id="modifyPwdForm_explain_text">You can modify your password using the form bellow.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td>
                                <span id="modifyPwdForm_old_pwd_text" class="label">Current password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="old_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span id="modifyPwdForm_new_pwd_text" class="label">New password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="new_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span id="modifyPwdForm_confirm_pwd_text" class="label">Confirm new password</span>
                                <span class="field-state">*</span>
                            </td>
                            <td>
                                <input type="password" name="confirm_pwd" autocomplete="off">
                            </td>
                        </tr>
                        <tr id="modifyPwdForm_help_tr" style="display:none">
                            <td colspan="2" class="field-state">
                                <span id="modifyPwdForm_help_link" class="helper">&nbsp;</span>
                            </td>
                        </tr>
                        <tr id="modifyPwdForm_help_block" class="phone-help" style="display:none">
                            <!-- Display help to show the profile password constraint -->
                            <td colspan="2">
                                <table>
                                    <tr>
                                        <td style="width: 20%;">
                                            &nbsp;
                                        </td>
                                        <td style="width: 80%;">
                                            <div style="text-align: left">
                                                <span id="modifyPwdHelpBlock_text">Your password has to be follow those rules:</span>
                                                <ul id="modifyPwdForm_help_list">
                                                    <li style="display:none">
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="field-state">
                                <span id="modifyPwdForm_fields_state_text" class="field-state">* Mandatory fields</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="modifyPwdForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="modifyPwdForm_confirm_button">Confirm</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="getPurchaseSummaryLink" style="display:none">
                    <!-- Link to access to Get Purchase Summary Form -->
                    <a id="getPurchaseSummaryLink_link" href="#"><span id="getPurchaseSummaryLink_text">Get your last purchase summary</span></a>
                </div>
                <form name="getPurchaseSummaryForm" style="display:none">
                    <!-- Get Purchase Summary Form -->
                    <div class="title">
                        <span id="getPurchaseSummaryForm_title_text">Get your last purchase summary</span>
                    </div>
                    <div class="explain">
                        <span id="getPurchaseSummaryForm_explain_text">You can download your last purchase summary.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td class="label">
                                <span id="getPurchaseSummaryForm_amount_text">Amount</span>
                            </td>
                            <td class="feedback">
                                <span id="getPurchaseSummaryForm_amount_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <a id="getPurchaseSummaryForm_download_link" href="#" target="_blank"><span
                                        id="getPurchaseSummaryForm_download_link_text">Click here to download your summary</span></a>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="getPurchaseSummaryForm_back_button">Back</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="upgradeAccountForm" style="display:none">
                    <!-- Get Upgrade Account Form -->
                    <div class="title">
                        <span id="upgradeAccountForm_title_text">Manage my account</span>
                    </div>
                    <div class="explain">
                        <span id="upgradeAccountForm_explain_text">You can add more options to your account.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="upgradeAccountFormMultidevice" style="display:none">
                        <table>
                            <tr>
                                <td colspan="2">
                                    <fieldset>
                                        <legend><span id="upgradeAccountForm_package_description_text">Package description</span>
                                        </legend>
                                        <span id="upgradeAccountForm_package_description_value"></span>
                                    </fieldset>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span id="upgradeAccountForm_multidevice_text" class="label small-input">Additional connections</span>
                                </td>
                                <td>
                                    <input type="text" name="multidevice" autocomplete="off">
                                </td>
                            </tr>
                            <tr>
                                <td class="label">
                                    <span id="upgradeAccountForm_amount_text">Amount</span>
                                </td>
                                <td class="feedback">
                                    <span id="upgradeAccountForm_amount_value">-</span>
                                    <span id="upgradeAccountForm_amount_currency">&nbsp;</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    &nbsp;
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <button type="button" id="upgradeAccountFormMultidevice_back_button">Back</button>
                                </td>
                            </tr>
                            <tr id="upgradeAccountFormMultidevice_update_block">
                                <td colspan="2">
                                    <button type="button" id="upgradeAccountFormMultidevice_update_button">Update
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                </form>
                <form name="upgradeAccountOgoneRedirectForm" method="POST" target="_blank" style="display:none">
                    <!-- Mustn't be changed -->
                    <input type="hidden" name="PSPID" value=""><input type="hidden" name="USERID" value=""><input
                        type="hidden" name="PSWD" value=""><input type="hidden" name="ORDERID" value=""><input
                        type="hidden" name="AMOUNT" value=""><input type="hidden" name="CURRENCY" value=""><input
                        type="hidden" name="LANGUAGE" value=""><input type="hidden" name="SHASIGN" value="">
                    <button type="submit" id="upgradeAccountOgoneRedirectForm_pay_button">Pay</button>
                </form>
                <form name="upgradeAccountCheckForm" style="display:none">
                    <!-- PayPal Payment Check Form -->
                    <!-- Can be changed -->
                    <div class="title">
                        <span id="upgradeAccountCheckForm_title_text">Manage my account</span>
                    </div>
                    <div class="explain">
                        <span id="upgradeAccountCheckForm_explain_text">If you have completed the payment process or have remainings unactivated options, please click on the 'Check' button to check your payment and activate the options.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="upgradeAccountCheckForm_back_button">Back</button>
                                <button type="button" id="upgradeAccountCheckForm_check_button">Check</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="pwdRecoverySetLink" style="display:none">
                    <!-- Link to access to pwdRecoverySet Form -->
                    <a id="pwdRecoverySetLink_link" href="#"><span id="pwdRecoverySetLink_text">Manage my secret questions</span></a>
                </div>
                <form name="pwdRecoveryForm" style="display:none">
                    <div class="title">
                        <span id="pwdRecoveryForm_title_text">Password recovery</span>
                    </div>
                    <div class="explain">
                        <span id="pwdRecoveryForm_explain_text">This page will help you to regenerate a new password. Please fill in one of the fields bellow.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="pwdRecoveryForm_login_block">
                            <td>
                                <span id="pwdRecoveryForm_login_text" class="label">Login</span>
                            </td>
                            <td>
                                <input type="text" name="login">
                            </td>
                        </tr>
                        <tr id="pwdRecoveryForm_2_choices_block">
                            <td colspan="2">
                                <span id="pwdRecoveryForm_2_choices_text" class="label">OR</span>
                            </td>
                        </tr>
                        <tr id="pwdRecoveryForm_email_block">
                            <td>
                                <span id="pwdRecoveryForm_email_text" class="label">Email address</span>
                            </td>
                            <td>
                                <input type="text" name="email">
                            </td>
                        </tr>
                        <tr id="pwdRecoveryForm_3_choices_block">
                            <td colspan="2">
                                <span id="pwdRecoveryForm_3_choices_text" class="label">OR</span>
                            </td>
                        </tr>
                        <tr id="pwdRecoveryForm_phone_block">
                            <!-- Ask user to give his phone number (Display status depends on configuration settings) -->
                            <td>
                                <span id="pwdRecoveryForm_phone_help_link" class="helper">&nbsp;</span>
                                <span id="pwdRecoveryForm_phone_text" class="label">Phone number</span>
                            </td>
                            <td>
                                <input type="text" name="prefix" value="Prefix" id="pwdRecoveryForm_phone_prefix_value"
                                       class="phone-prefix"><input type="text" name="phone" value="Phone number"
                                                                   id="pwdRecoveryForm_phone_phone_value"
                                                                   class="phone-number">
                            </td>
                        </tr>
                        <tr id="pwdRecoveryForm_phone_help_block" class="phone-help" style="display:none">
                            <!-- Display help to fill the phone number inputs -->
                            <td>
                                <table>
                                    <tr>
                                        <td>
                                            <span id="pwdRecoveryForm_phone_help_text">To fill in the phone number field, you must give the prefix (first input) then your phone number (second input).</span>
                                            <span style="white-space:nowrap">
								<span id="pwdRecoveryForm_phone_help_example_text">Ex: For Great Britain</span>
							</span>
                                            <span style="white-space:nowrap">
								<input type="text" name="prefix_example" value="44"
                                       id="pwdRecoveryForm_phone_help_prefix_example_value" disabled
                                       class="phone-prefix"><input type="text" name="phone_example" value="xxxxxxxxxx"
                                                                   id="pwdRecoveryForm_phone_help_phone_example_value"
                                                                   disabled class="phone-number"></span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/nl.png">&nbsp;&nbsp;31</p>
                                            <p><img src="resources/_images/flags/fr.png">&nbsp;&nbsp;33</p>
                                            <p><img src="resources/_images/flags/es.png">&nbsp;&nbsp;34</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/it.png">&nbsp;&nbsp;39</p>
                                            <p><img src="resources/_images/flags/en.png">&nbsp;&nbsp;44</p>
                                            <p><img src="resources/_images/flags/de.png">&nbsp;&nbsp;49</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/pl.png">&nbsp;&nbsp;48</p>
                                            <p><img src="resources/_images/flags/pt.png">&nbsp;&nbsp;351</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" id="pwdRecoveryForm_back_button">Back</button>
                            </td>
                            <td>
                                <button type="submit" id="pwdRecoveryForm_confirm_button">Confirm</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="pwdRecoveryResendForm" style="display:none">
                    <div class="title">
                        <span id="pwdRecoveryResendForm_title_text">Password recovery</span>
                    </div>
                    <div class="explain">
                        <span id="pwdRecoveryResendForm_explain_text">This page will help you to regenerate a new password. Please fill in one of the fields bellow.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table id="pwdRecoveryResendForm_links_block" style="display:none">
                        <tr id="pwdRecoveryResendForm_email_link_block" style="display:none">
                            <td colspan="2">
                                <a id="pwdRecoveryResendForm_email_link" href="#"><span
                                        id="pwdRecoveryResendForm_email_text">Resend my password by email</span></a>
                            </td>
                        </tr>
                        <tr id="pwdRecoveryResendForm_sms_link_block" style="display:none">
                            <td colspan="2">
                                <a id="pwdRecoveryResendForm_sms_link" href="#"><span
                                        id="pwdRecoveryResendForm_sms_text">Resend my password by SMS</span></a>
                            </td>
                        </tr>
                        <tr id="pwdRecoveryResendForm_questions_link_block" style="display:none">
                            <td colspan="2">
                                <a id="pwdRecoveryResendForm_questions_link" href="#"><span
                                        id="pwdRecoveryResendForm_questions_text">Answer my secret questions to get a new password</span></a>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="pwdRecoveryResendForm_back_button">Back</button>
                            </td>
                        </tr>
                    </table>
                    <table id="pwdRecoveryResendForm_questions_block" style="display:none">
                        <tr>
                            <td>
                                <span id="pwdRecoveryResendForm_questionLabel_text" class="label">Question</span>
                                &nbsp;&nbsp;
                            </td>
                            <td>
                                &nbsp;&nbsp;
                                <span id="pwdRecoveryResendForm_answerLabel_text" class="label">My answer</span>
                            </td>
                        </tr>
                        <tr id="pwdRecoveryResendForm_question_base_block" style="display:none">
                            <td>
                                <span id="pwdRecoveryResendForm_question_base_value"></span>
                            </td>
                            <td>
                                <input type="text" name="answer_base">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" id="pwdRecoveryResendForm_questions_back_button">Back</button>
                            </td>
                            <td>
                                <button type="submit" id="pwdRecoveryResendForm_questions_update_button">Update</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="pwdRecoveryResendResultForm" style="display:none">
                    <div class="title">
                        <span id="pwdRecoveryResendResultForm_title_text">Password recovery</span>
                    </div>
                    <div class="explain">
                        <span id="pwdRecoveryResendResultForm_explain_text">Please take note of your new password. It will be needed to sign in.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td>
                                <span id="pwdRecoveryResendResultForm_password_text" class="label">Password</span>
                            </td>
                            <td class="feedback">
                                <span id="pwdRecoveryResendResultForm_password_value"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="pwdRecoveryResendResultForm_back_button">Back</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="pwdRecoverySetForm" style="display:none">
                    <div class="title">
                        <span id="pwdRecoverySetForm_title_text">Password recovery - Secret questions</span>
                    </div>
                    <div class="explain">
                        <span id="pwdRecoverySetForm_explain_text">In order to recover your password, you should choose your secret question and answer it.</span>
                        <!-- Plural => secret questions and answer them (if not only one secret question) -->
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td>
                                <span id="pwdRecoverySetForm_questionLabel_text" class="label">Question</span>
                                &nbsp;&nbsp;
                            </td>
                            <td>
                                &nbsp;&nbsp;
                                <span id="pwdRecoverySetForm_answerLabel_text" class="label">My answer</span>
                            </td>
                        </tr>
                        <tr id="pwdRecoverySetForm_question_base_block" style="display:none">
                            <td>
                                <select name="question_base">
                                    <option value="" id="pwdRecoverySetForm_question_base_default_option" disabled
                                            selected>Choose a question
                                    </option>
                                </select>
                            </td>
                            <td>
                                <input type="text" name="answer_base">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" id="pwdRecoverySetForm_back_button">Back</button>
                            </td>
                            <td>
                                <button type="submit" id="pwdRecoverySetForm_update_button">Update</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="manageAccountLink" style="display:none">
                    <!-- Link to access to Manage Account Form -->
                    <a id="manageAccountLink_link" href="#"><span
                            id="manageAccountLink_text">Manage my account</span></a>
                </div>
                <form name="manageAccountForm" style="display:none">
                    <!-- Get Upgrade Account Form -->
                    <div class="title">
                        <span id="manageAccountForm_title_text">Manage my account</span>
                    </div>
                    <div class="explain">
                        <span id="manageAccountForm_explain_text">You can update your account settings.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table id="manageAccountForm_links_block">
                        <tr id="manageAccountForm_links_personal_settings_link_block" style="display:none">
                            <td colspan="2">
                                <a id="manageAccountForm_links_personal_settings_link" href="#"><span
                                        id="manageAccountForm_links_personal_settings_link_text">Modify my settings</span></a>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_links_devices_link_block" style="display:none">
                            <td colspan="2">
                                <a id="manageAccountForm_links_devices_link" href="#"><span
                                        id="manageAccountForm_links_devices_link_text">Modify my devices</span></a>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_links_modify_my_package_block" style="display:none">
                            <td colspan="2">
                                <a id="manageAccountForm_links_modify_my_package_link" href="#"><span
                                        id="manageAccountForm_links_modify_my_package_text">Modify my package</span></a>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_links_account_refill_link_block" style="display:none">
                            <td colspan="2">
                                <a id="manageAccountForm_links_account_refill_link" href="#"><span
                                        id="manageAccountForm_links_account_refill_link_text">Add options to your account</span></a>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_links_others_links_block">
                            <td colspan="2"></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <div class="explain">
                                    <span id="upgradeAccountForm_links_explain_text">You can add more options to your account.</span>
                                </div>
                                <div id="upgradeAccountForm_separator" class="h-separator"
                                     style="padding-left:0;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <a id="upgradeAccountFormLinks_add_simultaneous_connection_link" href="#"><span
                                        id="upgradeAccountFormLinks_add_simultaneous_connection_text">Add simultaneous connections</span></a>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <a id="upgradeAccountFormLinks_check_payment_link" href="#"><span
                                        id="upgradeAccountFormLinks_check_payment_text">Check your last payment</span></a>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="manageAccountForm_links_back_button">Back</button>
                            </td>
                        </tr>
                    </table>
                    <table id="manageAccountForm_personal_settings_block" style="display:none">
                        <tr id="manageAccountForm_personal_settings_last_name_block">
                            <!-- Ask user to give his last name (Display status depends on configuration settings) -->
                            <td>
                                <span id="manageAccountForm_personal_settings_last_name_text"
                                      class="label">Last name</span>
                                <span id="manageAccountForm_personal_settings_last_name_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="last_name">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_first_name_block">
                            <!-- Ask user to give his first name (Display status depends on configuration settings) -->
                            <td>
                                <span id="manageAccountForm_personal_settings_first_name_text"
                                      class="label">First name</span>
                                <span id="manageAccountForm_personal_settings_first_name_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="first_name">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_email_block">
                            <!-- Ask user to give his email address (Display status depends on configuration settings) -->
                            <td>
                                <span id="manageAccountForm_personal_settings_email_text"
                                      class="label">Email address</span>
                                <span id="manageAccountForm_personal_settings_email_state" class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="email">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_phone_block">
                            <!-- Ask user to give his phone number (Display status depends on configuration settings) -->
                            <td>
                                <span id="manageAccountForm_personal_settings_phone_help_link"
                                      class="helper">&nbsp;</span>
                                <span id="manageAccountForm_personal_settings_phone_text"
                                      class="label">Phone number</span>
                                <span id="manageAccountForm_personal_settings_phone_state" class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="prefix" value="Prefix"
                                       id="manageAccountForm_personal_settings_phone_prefix_value" class="phone-prefix"
                                       style="display:none; margin-right: 8px;"><input type="text" name="phone" value=""
                                                                                       id="manageAccountForm_personal_settings_phone_phone_value"
                                                                                       class="phone-number"
                                                                                       style="margin-left:0px;">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_phone_help_block" class="phone-help"
                            style="display:none">
                            <!-- Display help to fill the phone number inputs -->
                            <td>
                                <table>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_phone_help_text">To fill in the phone number field, you must give the prefix (first input) then your phone number (second input).</span>
                                            <span style="white-space:nowrap">
								<span id="manageAccountForm_personal_settings_phone_help_example_text">Ex: For Great Britain</span>
							</span>
                                            <span style="white-space:nowrap">
								<input type="text" name="prefix_example" value="44"
                                       id="manageAccountForm_personal_settings_phone_help_prefix_example_value" disabled
                                       class="phone-prefix"><input type="text" name="phone_example" value="xxxxxxxxxx"
                                                                   id="manageAccountForm_personal_settings_phone_help_phone_example_value"
                                                                   disabled class="phone-number"></span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/nl.png">&nbsp;&nbsp;31</p>
                                            <p><img src="resources/_images/flags/fr.png">&nbsp;&nbsp;33</p>
                                            <p><img src="resources/_images/flags/es.png">&nbsp;&nbsp;34</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/it.png">&nbsp;&nbsp;39</p>
                                            <p><img src="resources/_images/flags/en.png">&nbsp;&nbsp;44</p>
                                            <p><img src="resources/_images/flags/de.png">&nbsp;&nbsp;49</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/pl.png">&nbsp;&nbsp;48</p>
                                            <p><img src="resources/_images/flags/pt.png">&nbsp;&nbsp;351</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_organizational_unit_name_block">
                            <!-- Ask user to give his organizational unit name (Display status depends on configuration settings) -->
                            <td>
                                <span id="manageAccountForm_personal_settings_organizational_unit_name_text"
                                      class="label">Company name</span>
                                <span id="manageAccountForm_personal_settings_organizational_unit_name_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="organizational_unit_name">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_postal_address_block" class="postalAddress">
                            <!-- Ask user to give his postal address (Display status depends on configuration settings) -->
                            <td colspan="2" style="border-spacing:0px">
                                <table>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_address_text"
                                                  class="label">Postal Address</span>
                                            <span id="manageAccountForm_personal_settings_postal_address_state"
                                                  class="field-state">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_address">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_code_text"
                                                  class="label">Postal Code</span>
                                            <span id="manageAccountForm_personal_settings_postal_code_state"
                                                  class="field-state">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_code">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_locality_name_text"
                                                  class="label">Locality</span>
                                            <span id="manageAccountForm_personal_settings_postal_locality_name_state"
                                                  class="field-state">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_locality_name">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_postoffice_box_text"
                                                  class="label">Postoffice box</span>
                                            <span id="manageAccountForm_personal_settings_postal_postoffice_box_state"
                                                  class="field-state" style="visibility:hidden">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_postoffice_box">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_state_or_province_name_text"
                                                  class="label">State or Province</span>
                                            <span id="manageAccountForm_personal_settings_postal_state_or_province_name_state"
                                                  class="field-state" style="visibility:hidden">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_state_or_province_name">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span id="manageAccountForm_personal_settings_postal_country_name_text"
                                                  class="label">Country</span>
                                            <span id="manageAccountForm_personal_settings_postal_country_name_state"
                                                  class="field-state">*</span>
                                        </td>
                                        <td>
                                            <input type="text" name="postal_country_name">
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_personal_field_1_block" style="display:none">
                            <td>
                                <span id="manageAccountForm_personal_settings_personal_field_1_text"
                                      class="label"></span>
                                <span id="manageAccountForm_personal_settings_personal_field_1_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="personal_field_1">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_personal_field_2_block" style="display:none">
                            <td>
                                <span id="manageAccountForm_personal_settings_personal_field_2_text"
                                      class="label"></span>
                                <span id="manageAccountForm_personal_settings_personal_field_2_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="personal_field_2">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_personal_field_3_block" style="display:none">
                            <td>
                                <span id="manageAccountForm_personal_settings_personal_field_3_text"
                                      class="label"></span>
                                <span id="manageAccountForm_personal_settings_personal_field_3_state"
                                      class="field-state">*</span>
                            </td>
                            <td>
                                <input type="text" name="personal_field_3">
                            </td>
                        </tr>
                        <tr id="manageAccountForm_personal_settings_personal_fields_state_block">
                            <td colspan="2" class="field-state">
                                <span id="manageAccountForm_personal_settings_personal_fields_state_text"
                                      class="field-state">* Mandatory fields</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" id="manageAccountForm_personal_settings_back_button">Back</button>
                            </td>
                            <td>
                                <button type="button" id="manageAccountForm_personal_settings_update_button">Update
                                </button>
                            </td>
                        </tr>
                    </table>
                    <table id="manageAccountForm_devices_block" style="display:none">
                        <tr>
                            <td>
                                <span id="manageAccountForm_devices_mac_address_text" class="label">MAC Address</span>
                                &nbsp;&nbsp;
                            </td>
                            <td>
                                &nbsp;&nbsp;
                                <span id="manageAccountForm_devices_comment_text" class="label">Comment</span>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_devices_no_device_block">
                            <td colspan="2">
                                <span id="manageAccountForm_devices_no_device_text">No registered devices</span>
                            </td>
                        </tr>
                        <tr id="manageAccountForm_devices_base_block" style="display:none">
                            <td>
                                <div class="trashButton"></div>
                                &nbsp;
                                <span id="manageAccountForm_devices_base_value">&nbsp;</span>
                            </td>
                            <td>
                                <input type="text" name="device_base_comment">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" id="manageAccountForm_devices_back_button">Back</button>
                            </td>
                            <td>
                                <button type="button" id="manageAccountForm_devices_update_button">Update</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="accountRefillForm" style="display:none">
                    <div class="title">
                        <span id="accountRefillForm_title_text">Manage my account</span>
                    </div>
                    <div class="explain" id="accountRefillForm_explain">
                        <span id="accountRefillForm_explain_text">You can add more options to your account.</span>
                        <span id="accountRefillForm_option_user_explain">Select an option to obtain its description or enter a refill code</span>
                    </div>
                    <div class="h-separator"></div>
                    <table id="accountRefillForm_table">
                        <!-- Will be hidden after a payment -->
                        <tr>
                            <td>
                                <span id="accountRefillForm_select_option_text" class="label">Select an option</span>
                            </td>
                            <td>
                                <select name="select_package">
                                    <option value="" id="accountRefillForm_default_option" disabled selected>Choose an
                                        option
                                    </option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend><span
                                            id="accountRefillForm_option_description_text">Option description</span>
                                    </legend>
                                    <span id="accountRefillForm_option_description_explain">Select an option to obtain its description or enter a refill code</span>
                                    <span id="accountRefillForm_option_description_value"></span>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                                &nbsp;
                            </td>
                        </tr>
                    </table>
                    <div class="explain" id="accountRefillForm_behavior_explain" style="display:none">
                        <span id="accountRefillForm_option_behaviour_explain">Please enter your login and password</span>
                    </div>
                    <div class="h-separator"></div>
                    <div>
                        <table>
                            <tr>
                                <td>
                                    <span id="accountRefillForm_login_text" class="label small-input">Login</span>
                                </td>
                                <td>
                                    <input type="text" name="login" autocomplete="off">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span id="refillForm_password_text" class="label small-input">PASSWORD</span>
                                </td>
                                <td>
                                    <input type="password" name="password" autocomplete="on">
                                </td>
                            </tr>
                            <tr id="accountRefillForm_free_refill_line">
                                <td>
                                    <span id="accountRefillForm_RefillCode_text"
                                          class="label small-input">Refill code</span>
                                </td>
                                <td>
                                    <input type="text" name="refillcode" autocomplete="off">
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    &nbsp;
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <button type="button" id="accountRefillForm_back_button">Back</button>
                                    &nbsp;
                                    <button type="submit" id="accountRefillForm_confirm_button">Confirm</button>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <div id="refillForm_subscriptionChoice_grid"
                             style="text-align: center; display: inline-block; zoom: 1;">
                        </div>
                    </div>

                    <div id="paypalRefillLink" class="hoverLink"
                         style="display:none; font-weight: bold; width: 200px; height: 80px; color: #144679; float:left">
                        <!-- Link to access to Paypal payment Form -->
                        <div class="paypalSquareBox refillPaypalSquareBox" style="display:inline-block;"></div>
                        <br><span
                            id="paypalRefillLink_text">Refill your account after online payment through Paypal</span>
                    </div>

                    <div id="ogoneRefillLink" class="hoverLink"
                         style="display:none; font-weight: bold; width: 200px; height: 80px; color: #0083CA; float:left">
                        <!-- Link to access to Ogone payment Form -->
                        <div class="ogoneSquareBox refillOgoneSquareBox" style="display:inline-block;"></div>
                        <br><span
                            id="ogoneRefillLink_text">Refill your account after online payment through Ingenico</span>
                    </div>

                </form>
                <form name="autoLogonForm" style="display:none">
                    <!-- Auto Logon Form -->
                    <div class="title">
                        <span id="autoLogonForm_title_text">Connection</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="autoLogonForm_policy_block">
                            <!-- Check Box Confirm (Visible status depends on configuration option) -->
                            <td colspan="2">
                                <input type="checkbox" name="policy_accept">&nbsp;
                                <span id="autoLogonForm_policy_text"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="submit" id="autoLogonForm_connect_button">Connection</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="oneSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to One Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/one.png">
                            </td>
                            <td>
                                <span id="oneSubscriptionLink_text">Connection without credentials</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="oneSubscriptionErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="oneSubscriptionErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="oneSubscriptionErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="oneSubscriptionForm" style="display:none">
                    <!-- One Subscription Form (Will be hidden on subscribe success) -->
                    <div id="one_common_subscription_fields">
                    </div>
                    <table id="one_specific_subscription_fields">
                        <tr id="oneSubscriptionForm_connect_policy_block">
                            <!-- Ask user to accept connect policy (Display status depends on configuration settings) -->
                            <td colspan="2">
                                <input type="checkbox" name="connect_policy_accept">&nbsp;
                                <span id="oneSubscriptionForm_connect_policy_text"></span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a id="oneSubscriptionForm_other_choices_link" href="#"><span
                                        id="oneSubscriptionForm_other_choices_link_text">Other choices</span></a>
                            </td>
                            <td>
                                <button type="submit" id="oneSubscriptionForm_connect_button">Connection</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="directSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to Direct Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/direct.png">
                            </td>
                            <td>
                                <span id="directSubscriptionLink_text">Receive your credentials on this portal</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="directSubscriptionErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="directSubscriptionErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="directSubscriptionErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="directSubscriptionForm" style="display:none">
                    <!-- Direct Subscription Form (Will be hidden on subscribe success) -->
                    <div class="title">
                        <span id="directSubscriptionForm_title_text">Open Registration</span>
                    </div>
                    <div class="explain">
                        <span id="directSubscriptionForm_explain_text">Fill in all the mandatory fields below to register. Your login and password will be displayed on this portal.</span>
                        <br><span id="directSubscriptionForm_explain_sponsoring_text">Your demand will be sent to your sponsor. You will be informed once your account will be activated.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="direct_common_subscription_fields">
                    </div>
                    <table id="direct_specific_subscription_fields">
                        <tr>
                            <td colspan="2">
                                <button type="button" id="directSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="directSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="directSubscriptionResultForm" style="display:none">
                    <!-- Direct Subscription Result Form (Will be show on subscribe success)-->
                    <div class="title">
                        <span id="directSubscriptionResultForm_title_text">Open Registration</span>
                    </div>
                    <div class="explain">
                        <span id="directSubscriptionResultForm_explain_text">Please take note of your account settings. There will be needed to sign in.</span>
                    </div>
                    <div class="subtitle" id="directSubscriptionResultForm_dpsk_title_block">
                        <span id="directSubscriptionResultForm_dpsk_title_text">Secured Wi-Fi configuration settings</span>
                    </div>
                    <div class="explain" id="directSubscriptionResultForm_dpsk_explain_block">
                        <span id="directSubscriptionResultForm_dpsk_explain_text">Please connect to the new Wi-Fi network with the following configuration parameters.</span>
                        <span id="directSubscriptionResultForm_dpsk_download_explain_text">Please use the automatic configuration program by clicking on the link below to connect to the new Wi-Fi network.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="directSubscriptionResultForm_login_block">
                            <td>
                                <span id="directSubscriptionResultForm_login_text" class="label">Login</span>
                            </td>
                            <td class="feedback">
                                <span id="directSubscriptionResultForm_login_value"></span>
                            </td>
                        </tr>
                        <tr id="directSubscriptionResultForm_password_block">
                            <td>
                                <span id="directSubscriptionResultForm_password_text" class="label">Password</span>
                            </td>
                            <td class="feedback">
                                <span id="directSubscriptionResultForm_password_value"></span>
                            </td>
                        </tr>
                        <tr id="directSubscriptionResultForm_dpsk_wlan_block">
                            <td>
                                <span id="directSubscriptionResultForm_dpsk_wlan_text" class="label">Secured SSID</span>
                            </td>
                            <td class="feedback">
                                <span id="directSubscriptionResultForm_dpsk_wlan_value"></span>
                            </td>
                        </tr>
                        <tr id="directSubscriptionResultForm_dpsk_passphrase_block">
                            <td>
                                <span id="directSubscriptionResultForm_dpsk_passphrase_text" class="label">DPSK Passphrase</span>
                            </td>
                            <td class="feedback">
                                <span id="directSubscriptionResultForm_dpsk_passphrase_value"></span>
                            </td>
                        </tr>
                        <tr id="directSubscriptionResultForm_dpsk_download_link_block">
                            <td>
                                <span id="directSubscription_dpsk_download_link_text"
                                      class="label">DPSK Installer</span>
                            </td>
                            <td class="feedback">
                                <a id="directSubscription_dpsk_download_link" href="#" target="_blank"><span
                                        id="directSubscriptionResultForm_dpsk_download_link_text">Download</span></a>
                            </td>
                        </tr>
                    </table>
                    <br>
                    <div>
                        <button type="submit" id="directSubscriptionResultForm_back_button">Back</button>
                    </div>
                </form>
                <div id="printSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to print Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/print.png">
                            </td>
                            <td>
                                <span id="printSubscriptionLink_text">Print your credentials</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="printSubscriptionErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="printSubscriptionErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="printSubscriptionErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="printSubscriptionForm" style="display:none">
                    <!-- Print Subscription Form (Will be hidden on subscribe success) -->
                    <div class="title">
                        <span id="printSubscriptionForm_title_text">Print your credentials</span>
                    </div>
                    <div class="explain">
                        <span id="printSubscriptionForm_explain_text">Fill in all the mandatory fields below to register. Your credentials will be available on a printed connection ticket.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="print_common_subscription_fields">
                    </div>
                    <table id="print_specific_subscription_fields">
                        <tr>
                            <td colspan="2">
                                <button type="button" id="printSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="printSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="printSubscriptionResultForm" style="display:none">
                    <!-- Print Subscription Result Form (Will be show on subscribe success)-->
                    <div class="title">
                        <span id="printSubscriptionResultForm_title_text">Print your credentials</span>
                    </div>
                    <div class="explain">
                        <span id="printSubscriptionResultForm_explain_text">Please retrieve your printed connection ticket. Your credentials will be needed to sign in.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td colspan="2">
                                <button type="submit" id="printSubscriptionResultForm_back_button">Back</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="smsSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to SMS Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/sms.png">
                            </td>
                            <td>
                                <span id="smsSubscriptionLink_text">Receive your credentials by SMS</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="smsSubscriptionForm" style="display:none">
                    <!-- SMS Subscription Form -->
                    <div class="title">
                        <span id="smsSubscriptionForm_title_text">SMS Register</span>
                    </div>
                    <div class="explain">
                        <span id="smsSubscriptionForm_explain_text">Fill in all the mandatory fields below to register.</span>
                        <br><span id="smsSubscriptionForm_caution_text" class="light-caution">Caution : your cell phone number must be valid, as it will be used to send your connection ticket via SMS.</span>
                        <br><span id="smsSubscriptionForm_explain_sponsoring_text">Your demand will be sent to your sponsor. You will be informed once your account will be activated.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="sms_common_subscription_fields">
                    </div>
                    <table id="sms_specific_subscription_fields">
                        <!-- Will be hidden on subscribe success -->
                        <tr>
                            <td colspan="2">
                                <button type="button" id="smsSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="smsSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="mailSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to Mail Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/mail.png">
                            </td>
                            <td>
                                <span id="mailSubscriptionLink_text">Receive your credentials by EMail</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="mailSubscriptionForm" style="display:none">
                    <!-- Mail Subscription Form -->
                    <div class="title">
                        <span id="mailSubscriptionForm_title_text">EMail Register</span>
                    </div>
                    <div class="explain">
                        <span id="mailSubscriptionForm_explain_text">Fill in all the mandatory fields below to register. Once registration effective, you will have severals minutes to check your email account, and gather your login and password. This time elapsed, you will be forced to re-subscribe.</span>
                        <br><span id="mailSubscriptionForm_caution_text" class="light-caution">Caution : your email address must be valid, as it will be used to send your connection ticket via email.</span>
                        <br><span id="mailSubscriptionForm_explain_sponsoring_text">Your demand will be sent to your sponsor. You will be informed once your account will be activated.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="mail_common_subscription_fields">
                    </div>
                    <table id="mail_specific_subscription_fields">
                        <!-- Will be hidden on subscribe success -->
                        <tr>
                            <td colspan="2">
                                <button type="button" id="mailSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="mailSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <div id="paypalSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to Paypal Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/paypal.png">
                            </td>
                            <td>
                                <span id="paypalSubscriptionLink_text">Receive your credentials after an online payment through Paypal</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="paypalSubscriptionErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="paypalSubscriptionErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="paypalSubscriptionErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="paypalSubscriptionForm" style="display:none">
                    <!-- Paypal Subscription Form (Will be hidden on subscribe success) -->
                    <div class="title">
                        <span id="paypalSubscriptionForm_title_text">Online Payment Register</span>
                    </div>
                    <div class="explain">
                        <span id="paypalSubscriptionForm_explain_text">Fill in all the mandatory fields below to register. You could then use your credit card or your PayPal account to purchase a connection package.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="paypal_common_subscription_fields">
                    </div>
                    <table id="paypal_specific_subscription_fields">
                        <tr>
                            <td colspan="2">
                                <button type="button" id="paypalSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="paypalSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="paypalSubscriptionResultForm" style="display:none">
                    <!-- Paypal Subscription Result Form (Will be show on subscribe success) -->
                    <div class="title">
                        <span id="paypalSubscriptionResultForm_title_text">Online Payment Register</span>
                    </div>
                    <div class="explain">
                        <span id="paypalSubscriptionResultForm_explain_text">Please take note of your account settings. There will be needed to sign in.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="paypalSubscriptionResultForm_login_block">
                            <td>
                                <span id="paypalSubscriptionResultForm_login_text" class="label">Login</span>
                            </td>
                            <td class="feedback">
                                <span id="paypalSubscriptionResultForm_login_value"></span>
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_password_block">
                            <td>
                                <span id="paypalSubscriptionResultForm_password_text" class="label">Password</span>
                            </td>
                            <td class="feedback">
                                <span id="paypalSubscriptionResultForm_password_value"></span>
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_send_mail_block" style="display:none">
                            <!-- Allow user to receive account settings by Mail (Display status depends on configuration settings) -->
                            <td>
                                <span id="paypalSubscriptionResultForm_send_mail_text" class="label">Send my credentials by email</span>
                            </td>
                            <td class="feedback">
                                <input type="checkbox" name="send_mail">
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_send_email_address_block" style="display:none">
                            <!-- Ask user to give his email address (Display status depends on configuration settings) -->
                            <td>
                                <span id="paypalSubscriptionResultForm_send_email_address_text"
                                      class="label">Email</span>
                            </td>
                            <td>
                                <input type="email" name="email" value="Receiver email"
                                       id="paypalSubscriptionResultForm_send_email_address_value" class="phone-number">
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_send_sms_block" style="display:none">
                            <!-- Allow user to receive account settings by SMS (Display status depends on configuration settings) -->
                            <td>
                                <span id="paypalSubscriptionResultForm_send_sms_text" class="label">Send my credentials by SMS</span>
                            </td>
                            <td class="feedback">
                                <input type="checkbox" name="send_sms">
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_send_sms_phone_block" style="display:none">
                            <!-- Ask user to give his phone number (Display status depends on configuration settings) -->
                            <td>
                                <span id="paypalSubscriptionResultForm_send_sms_phone_help_link"
                                      class="helper">&nbsp;</span>
                                <span id="paypalSubscriptionResultForm_send_sms_phone_text"
                                      class="label">Phone number</span>
                            </td>
                            <td>
                                <input type="text" name="prefix" value="Prefix"
                                       id="paypalSubscriptionResultForm_send_sms_phone_prefix_value"
                                       class="phone-prefix"><input type="text" name="phone" value="Phone number"
                                                                   id="paypalSubscriptionResultForm_send_sms_phone_phone_value"
                                                                   class="phone-number">
                            </td>
                        </tr>
                        <tr id="paypalSubscriptionResultForm_send_sms_phone_help_block" class="phone-help"
                            style="display:none">
                            <!-- Display help to fill the phone number inputs -->
                            <td>
                                <table>
                                    <tr>
                                        <td>
                                            <span id="paypalSubscriptionResultForm_send_sms_phone_help_text">To fill in the phone number field, you must give the prefix (first input) then your phone number (second input).</span>
                                            <span style="white-space:nowrap">
								<span id="paypalSubscriptionResultForm_send_sms_phone_help_example_text">Ex: For Great Britain</span>
							</span>
                                            <span style="white-space:nowrap">
								<input type="text" name="prefix_example" value="44"
                                       id="paypalSubscriptionResultForm_send_sms_phone_help_prefix_example_value"
                                       disabled class="phone-prefix"><input type="text" name="phone_example"
                                                                            value="xxxxxxxxxx"
                                                                            id="paypalSubscriptionResultForm_send_sms_phone_help_phone_example_value"
                                                                            disabled class="phone-number"></span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/nl.png">&nbsp;&nbsp;31</p>
                                            <p><img src="resources/_images/flags/fr.png">&nbsp;&nbsp;33</p>
                                            <p><img src="resources/_images/flags/es.png">&nbsp;&nbsp;34</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/it.png">&nbsp;&nbsp;39</p>
                                            <p><img src="resources/_images/flags/en.png">&nbsp;&nbsp;44</p>
                                            <p><img src="resources/_images/flags/de.png">&nbsp;&nbsp;49</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/pl.png">&nbsp;&nbsp;48</p>
                                            <p><img src="resources/_images/flags/pt.png">&nbsp;&nbsp;351</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="paypalSubscriptionResultForm_back_button">Back</button>
                                &nbsp;
                                <button type="button" id="paypalSubscriptionResultForm_send_button"
                                        style="display:none">Send
                                </button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="paypalPaymentForm" style="display:none">
                    <!-- PayPal Payment Form -->
                    <!-- Can be changed -->
                    <div class="title">
                        <span id="paypalPaymentForm_title_text">Online payment package choice</span>
                    </div>
                    <div class="explain">
                        <span id="paypalPaymentForm_explain_text">To obtain time credit, you have to choose a package to buy then click on the 'Pay' button below. You will be redirected to the PayPal website. Once payment is completed, you will just need to click on the 'Connect' button to be connected.</span>
                    </div>
                    <div class="h-separator"></div>

                    <table>
                        <!-- Will be hidden after a payment -->
                        <tr>
                            <td>
                                <span id="paypalPaymentForm_select_package_text" class="label">Buy this package</span>
                            </td>
                            <td>
                                <select name="select_package" id="paypal_select_list">
                                    <option value="" id="paypalPaymentForm_default_package_option" disabled selected>
                                        Choose a package
                                    </option>
                                </select><span id="paypalPaymentForm_payment_detail_value"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend><span
                                            id="paypalPaymentForm_package_description_text">Package description</span>
                                    </legend>
                                    <span id="paypalPaymentForm_package_description_explain">Select package to obtain its description.</span>
                                    <span id="paypalPaymentForm_package_description_value"></span>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="paypalPaymentForm_back_button" style="display:none">Back
                                </button>
                                <button type="button" id="paypalPaymentForm_disconnect_button" style="display:none">
                                    Disconnect
                                </button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="paypalPaymentResultForm" style="display:none">
                    <!-- PayPal Payment Result Form -->
                    <!-- Can be changed -->
                    <div class="title">
                        <span id="paypalPaymentResultForm_title_text">Online payment package choice</span>
                    </div>
                    <div class="explain">
                        <span id="paypalPaymentResultForm_explain_text">If you have completed the payment process, please click on the 'Connect' button to be connected. If you loose the payment page, please disconnect then reconnect.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <!-- User remainging time before forced disconnection -->
                            <td class="label">
                                <span id="paypalPaymentResultForm_payment_timer_text">Automatic disconnection in</span>
                            </td>
                            <td class="feedback">
                                <span id="paypalPaymentResultForm_payment_timer_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="paypalPaymentResultForm_disconnect_button">Disconnect</button>
                                <button type="button" id="paypalPaymentResultForm_connect_button">Connect</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="paypalRedirectForm" method="POST" target="_blank" style="display:none">
                    <!-- Mustn't be changed -->
                    <input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="encrypted" value="">
                    <button type="button" id="paypalRedirectionForm_pay_button">Pay</button>
                    <button type="submit" id="paypalRedirectionForm_submit_button" style="display: none;"></button>
                </form>
                <div id="ogoneSubscriptionLink" class="hoverLink" style="display:none">
                    <!-- Link to access to Ogone Subscription Form -->
                    <table>
                        <tr>
                            <td>
                                <img src="resources/_images/ingenico.png">
                            </td>
                            <td>
                                <span id="ogoneSubscriptionLink_text">Receive your credentials after an online payment through Ogone services.</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="ogoneSubscriptionErrorBlock" style="display:none; text-align: left;">
                    <!-- Div to display errors -->
                    <table>
                        <tr>
                            <td style="width: 5%;">
                                &nbsp;
                            </td>
                            <td style="width: 95%;" nowrap>
                                <span id="ogoneSubscriptionErrorBlock_text">The password you entered is not valid:</span>
                                <ul id="ogoneSubscriptionErrorList">
                                    <li style="display:none">
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <form name="ogoneSubscriptionForm" style="display:none">
                    <!-- Ogone Subscription Form (Will be hidden on subscribe success) -->
                    <div class="title">
                        <span id="ogoneSubscriptionForm_title_text">Online Payment Register</span>
                    </div>
                    <div class="explain">
                        <span id="ogoneSubscriptionForm_explain_text">Fill in all the mandatory fields below to register. You could then use your credit card or your ogone account to purchase a connection package.</span>
                    </div>
                    <div class="h-separator"></div>
                    <div id="ogone_common_subscription_fields">
                    </div>
                    <table id="ogone_specific_subscription_fields">
                        <tr>
                            <td colspan="2">
                                <button type="button" id="ogoneSubscriptionForm_back_button">Back</button>
                                &nbsp;
                                <button type="submit" id="ogoneSubscriptionForm_subscribe_button">Subscribe</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="ogoneSubscriptionResultForm" style="display:none">
                    <!-- Ogone Subscription Result Form (Will be show on subscribe success) -->
                    <div class="title">
                        <span id="ogoneSubscriptionResultForm_title_text">Online Payment Register</span>
                    </div>
                    <div class="explain">
                        <span id="ogoneSubscriptionResultForm_explain_text">Please take note of your account settings. There will be needed to sign in.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr id="ogoneSubscriptionResultForm_login_block">
                            <td>
                                <span id="ogoneSubscriptionResultForm_login_text" class="label">Login</span>
                            </td>
                            <td class="feedback">
                                <span id="ogoneSubscriptionResultForm_login_value"></span>
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_password_block">
                            <td>
                                <span id="ogoneSubscriptionResultForm_password_text" class="label">Password</span>
                            </td>
                            <td class="feedback">
                                <span id="ogoneSubscriptionResultForm_password_value"></span>
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_send_mail_block" style="display:none">
                            <!-- Allow user to receive account settings by Mail (Display status depends on configuration settings) -->
                            <td>
                                <span id="ogoneSubscriptionResultForm_send_mail_text" class="label">Send my credentials by email</span>
                            </td>
                            <td class="feedback">
                                <input type="checkbox" name="send_mail">
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_send_email_address_block" style="display:none">
                            <!-- Ask user to give his email address (Display status depends on configuration settings) -->
                            <td>
                                <span id="ogoneSubscriptionResultForm_send_email_address_text"
                                      class="label">Email</span>
                            </td>
                            <td>
                                <input type="email" name="email" value="Receiver email"
                                       id="ogoneSubscriptionResultForm_send_email_address_value" class="phone-number">
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_send_sms_block" style="display:none">
                            <!-- Allow user to receive account settings by SMS (Display status depends on configuration settings) -->
                            <td>
                                <span id="ogoneSubscriptionResultForm_send_sms_text" class="label">Send my credentials by SMS</span>
                            </td>
                            <td class="feedback">
                                <input type="checkbox" name="send_sms">
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_send_sms_phone_block" style="display:none">
                            <!-- Ask user to give his phone number (Display status depends on configuration settings) -->
                            <td>
                                <span id="ogoneSubscriptionResultForm_send_sms_phone_help_link"
                                      class="helper">&nbsp;</span>
                                <span id="ogoneSubscriptionResultForm_send_sms_phone_text"
                                      class="label">Phone number</span>
                            </td>
                            <td>
                                <input type="text" name="prefix" value="Prefix"
                                       id="ogoneSubscriptionResultForm_send_sms_phone_prefix_value"
                                       class="phone-prefix"><input type="text" name="phone" value="Phone number"
                                                                   id="ogoneSubscriptionResultForm_send_sms_phone_phone_value"
                                                                   class="phone-number">
                            </td>
                        </tr>
                        <tr id="ogoneSubscriptionResultForm_send_sms_phone_help_block" class="phone-help"
                            style="display:none">
                            <!-- Display help to fill the phone number inputs -->
                            <td>
                                <table>
                                    <tr>
                                        <td>
                                            <span id="ogoneSubscriptionResultForm_send_sms_phone_help_text">To fill in the phone number field, you must give the prefix (first input) then your phone number (second input).</span>
                                            <span style="white-space:nowrap">
								<span id="ogoneSubscriptionResultForm_send_sms_phone_help_example_text">Ex: For Great Britain</span>
								<input type="text" name="prefix_example" value="44"
                                       id="ogoneSubscriptionResultForm_send_sms_phone_help_prefix_example_value"
                                       disabled class="phone-prefix"><input type="text" name="phone_example"
                                                                            value="xxxxxxxxxx"
                                                                            id="ogoneSubscriptionResultForm_send_sms_phone_help_phone_example_value"
                                                                            disabled class="phone-number"></span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/nl.png">&nbsp;&nbsp;31</p>
                                            <p><img src="resources/_images/flags/fr.png">&nbsp;&nbsp;33</p>
                                            <p><img src="resources/_images/flags/es.png">&nbsp;&nbsp;34</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/it.png">&nbsp;&nbsp;39</p>
                                            <p><img src="resources/_images/flags/en.png">&nbsp;&nbsp;44</p>
                                            <p><img src="resources/_images/flags/de.png">&nbsp;&nbsp;49</p>
                                        </td>
                                        <td nowrap>
                                            <p><img src="resources/_images/flags/pl.png">&nbsp;&nbsp;48</p>
                                            <p><img src="resources/_images/flags/pt.png">&nbsp;&nbsp;351</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="ogoneSubscriptionResultForm_back_button">Buy package</button>
                                &nbsp;
                                <button type="button" id="ogoneSubscriptionResultForm_send_button" style="display:none">
                                    Send
                                </button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="ogonePaymentForm" style="display:none">
                    <!-- ogone Payment Form -->
                    <!-- Can be changed -->
                    <div class="title">
                        <span id="ogonePaymentForm_title_text">Online payment package choice</span>
                    </div>
                    <div class="explain">
                        <span id="ogonePaymentForm_explain_text">To obtain time credit, you have to choose a package to buy then click on the 'Pay' button below. You will be redirected to the ogone website. Once payment is completed, you will just need to click on the 'Connect' button to be connected.</span>
                    </div>
                    <div class="h-separator"></div>

                    <table>
                        <!-- Will be hidden after a payment -->
                        <tr>
                            <td>
                                <span id="ogonePaymentForm_select_package_text" class="label">Buy this package</span>
                            </td>
                            <td>
                                <select name="select_package" id="ogone_select_list">
                                    <option value="" id="ogonePaymentForm_default_package_option" disabled selected>
                                        Choose a package
                                    </option>
                                </select><span id="ogonePaymentForm_payment_detail_value"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend><span
                                            id="ogonePaymentForm_package_description_text">Package description</span>
                                    </legend>
                                    <span id="ogonePaymentForm_package_description_explain">Select package to obtain its description.</span>
                                    <span id="ogonePaymentForm_package_description_value"></span>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="ogonePaymentForm_back_button" style="display:none">Back
                                </button>
                                <button type="button" id="ogonePaymentForm_disconnect_button" style="display:none">
                                    Disconnect
                                </button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="ogonePaymentResultForm" style="display:none">
                    <!-- ogone Payment Result Form -->
                    <!-- Can be changed -->
                    <div class="title">
                        <span id="ogonePaymentResultForm_title_text">Online payment package choice</span>
                    </div>
                    <div class="explain">
                        <span id="ogonePaymentResultForm_explain_text">If you have completed the payment process, please click on the 'Connect' button to be connected. If you loose the payment page, please disconnect then reconnect.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <!-- User remainging time before forced disconnection -->
                            <td class="label">
                                <span id="ogonePaymentResultForm_payment_timer_text">Automatic disconnection in</span>
                            </td>
                            <td class="feedback">
                                <span id="ogonePaymentResultForm_payment_timer_value">&nbsp;</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="ogonePaymentResultForm_disconnect_button">Disconnect</button>
                                <button type="button" id="ogonePaymentResultForm_connect_button">Connect</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="ogoneRedirectForm" method="POST" style="display:none">
                    <!-- Mustn't be changed -->
                    <input type="hidden" name="PSPID" value=""><input type="hidden" name="USERID" value=""><input
                        type="hidden" name="PSWD" value=""><input type="hidden" name="ORDERID" value=""><input
                        type="hidden" name="AMOUNT" value=""><input type="hidden" name="CURRENCY" value=""><input
                        type="hidden" name="LANGUAGE" value=""><input type="hidden" name="SHASIGN" value=""><input
                        type="hidden" name="ACCEPTURL" value=""><input type="hidden" name="DECLINEURL" value=""><input
                        type="hidden" name="EXCEPTIONURL" value=""><input type="hidden" name="CANCELURL" value="">
                    <button type="button" id="ogoneRedirectionForm_pay_button">Pay</button>
                    <button type="submit" id="ogoneRedirectionForm_submit_button" style="display: none;"></button>
                </form>
                <form name="pmsPaymentForm" style="display:none">
                    <!-- PMS Payment Form -->
                    <div class="title">
                        <span id="pmsPaymentForm_title_text">Package choice</span>
                    </div>
                    <div class="explain">
                        <span id="pmsPaymentForm_explain_text">To obtain time credit, you have to choose a package to buy then click on the 'Pay' button below.</span>
                    </div>
                    <br>
                    <div id="pmsPaymentForm_caution_block" class="caution" style="display:none">
                        <span id="pmsPaymentForm_caution_text">CAUTION: you are changing your package. All options of your current package will be lost.</span>
                        <br>
                    </div>
                    <br>
                    <div class="h-separator"></div>
                    <table id="pmsPaymentForm_block">
                        <tr>
                            <td>
                                <span id="pmsPaymentForm_select_package_text" class="label">Buy this package</span>
                            </td>
                            <td>
                                <select name="select_package">
                                    <option value="" id="pmsPaymentForm_default_package_option" disabled selected>Choose
                                        a package
                                    </option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset>
                                    <legend><span
                                            id="pmsPaymentForm_package_description_text">Package description</span>
                                    </legend>
                                    <span id="pmsPaymentForm_package_description_explain">Select package to obtain its description.</span>
                                    <span id="pmsPaymentForm_package_description_value">&nbsp;</span>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="button" id="pmsPaymentForm_cancel_button">Cancel</button>
                                &nbsp;
                                <button type="button" id="pmsPaymentForm_disconnect_button">Disconnect</button>
                                &nbsp;
                                <button type="submit" id="pmsPaymentForm_pay_button">Pay</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <form name="ppsSubscriptionForm" style="display:none">
                    <!-- PPS Logon Form -->
                    <div class="title">
                        <span id="ppsSubscriptionForm_title_text">Sign In</span>
                    </div>
                    <div class="explain">
                        <span id="ppsSubscriptionForm_explain_text">Enter your identification code, the expression in order to be connected.</span>
                    </div>
                    <div class="h-separator"></div>
                    <table>
                        <tr>
                            <td>
                                <span id="ppsSubscriptionForm_scratch_code_text"
                                      class="label">Identification code</span>
                            </td>
                            <td>
                                <input type="text" name="scratch_code" autocomplete="off">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                &nbsp;
                            </td>
                            <td>
                                <img id="ppsSubscriptionForm_captcha_code_img" src="#" style="display:none">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <span id="ppsSubscriptionForm_captcha_code_explain_text">Please copy the expression indicated above</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span id="ppsSubscriptionForm_captcha_code_text" class="label">Expression</span>
                            </td>
                            <td>
                                <input type="text" name="captcha_code" autocomplete="off">
                            </td>
                        </tr>
                        <tr id="ppsSubscriptionForm_policy_block">
                            <!-- Check Box Confirm (Visible status depends on configuration option) -->
                            <td colspan="2">
                                <br><input type="checkbox" name="policy_accept">&nbsp;
                                <span id="ppsSubscriptionForm_policy_text"></span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                                &nbsp;
                            </td>
                            <td>
                                <button type="submit" id="ppsSubscriptionForm_connect_button">Connect</button>
                            </td>
                        </tr>
                    </table>
                </form>
                <table id="common_subscription_fields">
                    <tr id="subscriptionForm_user_login_block">
                        <!-- User can choose his login (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_user_login_text" class="label">Login</span>
                            <span id="subscriptionForm_user_login_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="user_login" id="subscriptionForm_user_login">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_user_password_block">
                        <!-- User can choose his password (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_password_help_link" class="helper">&nbsp;</span>
                            <span id="subscriptionForm_user_password_text" class="label">Password</span>
                            <span id="subscriptionForm_user_password_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="password" name="user_password" id="subscriptionForm_user_password">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_password_help_block" class="phone-help" style="display:none">
                        <!-- Display help to show the profile password constraint -->
                        <td colspan="2">
                            <table>
                                <tr>
                                    <td style="width: 20%;">
                                        &nbsp;
                                    </td>
                                    <td style="width: 80%;">
                                        <div style="text-align: left">
                                            <span id="subscriptionForm_password_help_text">Your password has to be follow those rules:</span>
                                            <ul id="subscriptionForm_password_help_list">
                                                <li style="display:none">
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_user_password_confirm_block">
                        <!-- Link with the user_password input (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_user_password_confirm_text" class="label">Confirm Password</span>
                            <span id="subscriptionForm_user_password_confirm_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="password" name="user_password_confirm"
                                   id="subscriptionForm_user_password_confirm">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_last_name_block">
                        <!-- Ask user to give his last name (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_last_name_text" class="label">Last name</span>
                            <span id="subscriptionForm_last_name_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="last_name" id="subscriptionForm_last_name">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_first_name_block">
                        <!-- Ask user to give his first name (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_first_name_text" class="label">First name</span>
                            <span id="subscriptionForm_first_name_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="first_name" id="subscriptionForm_first_name">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_gender_block">
                        <!-- Ask user to give his gender (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_gender_text" class="label">Gender</span>
                            <span id="subscriptionForm_gender_state" class="field-state">*</span>
                        </td>
                        <td>
                            <table>
                                <tr>
                                    <td style="text-align: left;">
                                        <input type="radio" name="gender" value="M" id="subscriptionForm_gender_m"><span
                                            class="radio-label" id="subscriptionForm_gender_male_text">Male</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left;">
                                        <input type="radio" name="gender" value="F" id="subscriptionForm_gender_f"><span
                                            class="radio-label" id="subscriptionForm_gender_female_text">Female</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_birth_date_block">
                        <!-- Ask user to give his birth date (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_birth_date_text" class="label">Birth date</span>
                            <span id="subscriptionForm_birth_date_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="birth_date" placeholder="dd/mm/YYYY"
                                   id="subscriptionForm_birth_date" class="birth-date-edit"><img alt="Calendar"
                                                                                                 src="resources/_images/calendar.png"
                                                                                                 onclick="showCalendar('subscriptionForm_birth_date');"
                                                                                                 class="birth-date-calendar">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_email_block">
                        <!-- Ask user to give his email address (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_email_text" class="label">Email address</span>
                            <span id="subscriptionForm_email_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="email" id="subscriptionForm_email">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_phone_block">
                        <!-- Ask user to give his phone number (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_phone_help_link" class="helper">&nbsp;</span>
                            <span id="subscriptionForm_phone_text" class="label">Phone number</span>
                            <span id="subscriptionForm_phone_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="prefix" value="Prefix" id="subscriptionForm_phone_prefix_value"
                                   class="phone-prefix"><input type="text" name="phone" value="Phone number"
                                                               id="subscriptionForm_phone_phone_value"
                                                               class="phone-number">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_phone_help_block" class="phone-help" style="display:none">
                        <!-- Display help to fill the phone number inputs -->
                        <td>
                            <table>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_phone_help_text">To fill in the phone number field, you must give the prefix (first input) then your phone number (second input).</span>
                                        <span style="white-space:nowrap">
							<span id="subscriptionForm_phone_help_example_text">Ex: For Great Britain</span>
						</span>
                                        <span style="white-space:nowrap">
							<input type="text" name="prefix_example" value="44"
                                   id="subscriptionForm_phone_help_prefix_example_value" disabled
                                   class="phone-prefix"><input type="text" name="phone_example" value="xxxxxxxxxx"
                                                               id="subscriptionForm_phone_help_phone_example_value"
                                                               disabled class="phone-number"></span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td>
                            <table>
                                <tr>
                                    <td nowrap>
                                        <p><img src="resources/_images/flags/nl.png">&nbsp;&nbsp;31</p>
                                        <p><img src="resources/_images/flags/fr.png">&nbsp;&nbsp;33</p>
                                        <p><img src="resources/_images/flags/es.png">&nbsp;&nbsp;34</p>
                                    </td>
                                    <td nowrap>
                                        <p><img src="resources/_images/flags/it.png">&nbsp;&nbsp;39</p>
                                        <p><img src="resources/_images/flags/en.png">&nbsp;&nbsp;44</p>
                                        <p><img src="resources/_images/flags/de.png">&nbsp;&nbsp;49</p>
                                    </td>
                                    <td nowrap>
                                        <p><img src="resources/_images/flags/pl.png">&nbsp;&nbsp;48</p>
                                        <p><img src="resources/_images/flags/pt.png">&nbsp;&nbsp;351</p>
                                        <p><img src="resources/_images/flags/sw.png">&nbsp;&nbsp;41</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_organizational_unit_name_block">
                        <!-- Ask user to give his organizational unit name (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_organizational_unit_name_text" class="label">Company name</span>
                            <span id="subscriptionForm_organizational_unit_name_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="organizational_unit_name"
                                   id="subscriptionForm_organizational_unit_name">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_postal_address_block" class="postalAddress">
                        <!-- Ask user to give his postal address (Display status depends on configuration settings) -->
                        <td colspan="2" style="border-spacing:0px">
                            <table>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_address_text"
                                              class="label">Postal Address</span>
                                        <span id="subscriptionForm_postal_address_state" class="field-state">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_address" id="subscriptionForm_postal_address">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_code_text" class="label">Postal Code</span>
                                        <span id="subscriptionForm_postal_code_state" class="field-state">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_code" id="subscriptionForm_postal_code">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_locality_name_text"
                                              class="label">Locality</span>
                                        <span id="subscriptionForm_postal_locality_name_state"
                                              class="field-state">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_locality_name"
                                               id="subscriptionForm_postal_locality_name">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_postoffice_box_text" class="label">Postoffice box</span>
                                        <span id="subscriptionForm_postal_postoffice_box_state" class="field-state"
                                              style="visibility:hidden">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_postoffice_box"
                                               id="subscriptionForm_postal_postoffice_box">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_state_or_province_name_text" class="label">State or Province</span>
                                        <span id="subscriptionForm_postal_state_or_province_name_state"
                                              class="field-state" style="visibility:hidden">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_state_or_province_name"
                                               id="subscriptionForm_postal_state_or_province_name">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span id="subscriptionForm_postal_country_name_text"
                                              class="label">Country</span>
                                        <span id="subscriptionForm_postal_country_name_state"
                                              class="field-state">*</span>
                                    </td>
                                    <td>
                                        <input type="text" name="postal_country_name"
                                               id="subscriptionForm_postal_country_name">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_user_language_block">
                        <!-- Ask user to fill preferred language (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_user_language_text" class="label">Preferred language</span>
                            <span id="subscriptionForm_user_language_state" class="field-state">*</span>
                        </td>
                        <td>
                            <select name="user_language" style="height:22px" id="subscriptionForm_user_language">
                                <!-- It is possible to show a flag for each language in the list under FFox only. To enable this feature, follow the example below (english); -->
                                <!-- <option  style="background: url(./resources/_images/flags/en.png) no-repeat right;" value="en">English</option> -->
                                <option value="" selected id="user_language_not_specified_text">Not specified</option>
                                <option value="fr">Fran&ccedil;ais</option>
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                                <option value="es">Espa&ntilde;ol</option>
                                <option value="it">Italiano</option>
                                <option value="nl">Nederlands</option>
                                <option value="pt">Portugu&ecirc;s</option>
                                <option value="pl">Polski</option>
                                <option value="zh_CN">&#20013;&#25991;(&#31616;&#20307;)</option>
                                <option value="zh_TW">&#20013;&#25991;(&#32321;&#39636;)</option>
                                <option style="text-align:right;" value="ar_LB">&#1593;&#1585;&#1576;&#1610;</option>
                                <option value="ko">&#54620;&#44397;&#50612;</option>
                                <option value="ja">&#26085;&#26412;&#35486;</option>
                                <option value="th">&#3616;&#3634;&#3625;&#3634;&#3652;&#3607;&#3618;</option>
                                <option value="ru">&#1056;&#1091;&#1089;&#1089;&#1082;&#1080;&#1081; &#1103;&#1079;&#1099;&#1082;</option>
                                <option value="id">Bahasa Indonesia</option>
                            </select>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_interests_block">
                        <!-- Ask user to fill interests (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_interests_text" class="label">Interests</span>
                            <span id="subscriptionForm_interests_state" class="field-state">*</span>
                        </td>
                        <td>
                            <select name="interests" multiple id="subscriptionForm_interests">
                                <option value="antiques">Antiques</option>
                                <option value="art">Art</option>
                                <option value="celebrities">Celebrities (political, sports, entertainment)</option>
                                <option value="dance_clubbing">Dance / Clubbing</option>
                                <option value="ecology">Ecology</option>
                                <option value="events">Events</option>
                                <option value="fashion_shopping">Fashion / Shopping</option>
                                <option value="fooding_restaurants">Fooding / Restaurants</option>
                                <option value="gardening">Gardening</option>
                                <option value="interior_design">Interior design</option>
                                <option value="movies">Movies</option>
                                <option value="music">Music</option>
                                <option value="news">News</option>
                                <option value="reading">Reading</option>
                                <option value="series_tv_shows">Series / TV Shows</option>
                                <option value="social_networks">Social networks</option>
                                <option value="sports">Sports</option>
                                <option value="technology">Technology</option>
                                <option value="theater">Theater</option>
                                <option value="travel">Travel</option>
                                <option value="video_games">Video games</option>
                                <option value="wine">Wine</option>
                            </select>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_personal_field_1_block">
                        <!-- Ask user to fill the first personal field (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_personal_field_1_text" class="label"></span>
                            <span id="subscriptionForm_personal_field_1_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="personal_field_1" id="subscriptionForm_personal_field_1">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_personal_field_2_block">
                        <!-- Ask user to fill the second personal field (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_personal_field_2_text" class="label"></span>
                            <span id="subscriptionForm_personal_field_2_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="personal_field_2" id="subscriptionForm_personal_field_2">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_personal_field_3_block">
                        <!-- Ask user to fill the third personal field (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_personal_field_3_text" class="label"></span>
                            <span id="subscriptionForm_personal_field_3_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="personal_field_3" id="subscriptionForm_personal_field_3">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_sponsor_email_block">
                        <!-- Ask user to fill the email for sponsor (Display status depends on configuration settings) -->
                        <td>
                            <span id="subscriptionForm_sponsor_email_text" class="label"></span>
                            <span id="subscriptionForm_sponsor_email_state" class="field-state">*</span>
                        </td>
                        <td>
                            <input type="text" name="sponsor_email" id="subscriptionForm_sponsor_email">
                        </td>
                    </tr>
                    <tr id="subscriptionForm_policy_block">
                        <!-- Ask user to accept policy (Display status depends on configuration settings) -->
                        <td colspan="2">
                            <br><input type="checkbox" name="policy_accept" id="subscriptionForm_policy_accept">&nbsp;
                            <span id="subscriptionForm_policy_text"></span>
                        </td>
                    </tr>
                    <tr id="subscriptionForm_fields_state_block">
                        <!-- (Display status depends on configuration settings) -->
                        <td colspan="2" class="field-state">
                            <span id="subscriptionForm_fields_state_text" class="field-state">* Mandatory fields</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div id="editor_img_slice"><img src="resources/_images/horizontal_gradient.png" width="760" height="44" alt="">
        </div>
        <div id="editor_text_banner">
            <div id="editor_text_banner_fr" lang="fr">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Bienvenue</div>
            </div>
            <div id="editor_text_banner_de" lang="de" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Willkommen</div>
            </div>
            <div id="editor_text_banner_en" lang="en" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Welcome</div>
            </div>
            <div id="editor_text_banner_es" lang="es" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Bienvenido</div>
            </div>
            <div id="editor_text_banner_it" lang="it" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Benvenuto</div>
            </div>
            <div id="editor_text_banner_nl" lang="nl" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Welkom</div>
            </div>
            <div id="editor_text_banner_pt" lang="pt" style="display:none">
                <div style="font-weight:bold; font-size:2em; color:#64696C">Bem-vindo(a)</div>
            </div>
        </div>
        <div id="editor_img_logoIT"><img src="resources/_images/Logo%20Itescia%20Couleur.png" width="220" height="120"
                                         alt=""></div>
    </div>
    <div id="footer">
        <!-- The footer template -->
        <!-- Will be added on bottom of the page -->
        &nbsp;
    </div>
</div>
</body>

<!-- Mirrored from controller.access.network/101/portal/ by HTTrack Website Copier/3.x [XR&CO'2013], Mon, 24 Jun 2019 12:14:25 GMT -->
</html>
