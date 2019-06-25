/**
 * Fichier JavaScript global
 */

// Global variables
var refreshObj = new Object();
var timerObj = new Object();
var translationsAreLoaded = false;
var switch_package = false;

var isAppleCNA = (navigator.userAgent.match(/iPhone|iPad|iPod/i)
	&& navigator.userAgent.match(/mozilla\//i)
	&& navigator.userAgent.match(/applewebkit\//i)
	&& navigator.userAgent.match(/mobile\//i)
	&& ! navigator.userAgent.match(/safari/i));

var isAppleCNA_fakeclick = false;

$(document).ready(function() {
	// Patch to avoid intempestive informative widget apparition before its display management
	// at the end of the function displayStep cf #15143 and #15121.
	// Patch move from informative widget file to here to hide it as quick as possible.
	if (typeof informativeWidget_configure == 'function') {
		$('#widget_informative').hide();
	}
	// Initialize portal
	$.portal_api('init', initPortal);
});


function handle_force_disconnect()
{
	if ($.settings.user != undefined && $.settings.user.force_feedback_disconnect != undefined && $.settings.user.force_feedback_disconnect) {
		displayWaitingIcon(true);
		feedbackFormDisconnect();
		return true;
	}
	return false;
}


function handle_autoconnect()
{
	if ( $.settings.subscribe != undefined && $.settings.subscribe.autoconnect != undefined && $.settings.step=="LOGON") {
		$('form[name="logonForm"] input[name="login"]').val($.settings.subscribe.autoconnect.login);
		$('form[name="logonForm"] input[name="password"]').val($.settings.subscribe.autoconnect.password);

		var policy_accepted = $('form[name="logonForm"] input[name="policy_accept"]').is(':checked');

		if ( $.settings.logon != undefined && $.settings.logon.policy != undefined && $.settings.logon.policy.display == true && ! policy_accepted ) {
			// Policy is displayed and not accepted. User has to accept it before login.
			return false;
		}
		else {
			$.portal_api('setInAutoConnect', true);
			logonFormConnect();
			// avoid to display portal
			if ( $.settings.subscribe.autoconnect.follow_cloud_redirect == true ) {
				return true;
			}
		}

	}

	return false;
}

function displayWaitingIcon( state )
{
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if( display == true)
	{
		$("#waiting_icon_block").show();
		$("#reserved_block").show();
	}
	else
	{
		$("#waiting_icon_block").hide();
	}
}


/* Called just after the portal was loaded in order to get all translations and configure all sub-modules */
function initPortal(data) {

	if ($.settings != undefined && $.settings.redirect != undefined) {
		window.location = $.settings.redirect;
	}


	/* Gather translation file then translate */
	var portal_format = null;
	var path_tokens = window.location.pathname.split( '/' );
	for(var i = 0; i < path_tokens.length; i++) {
		if(path_tokens[i].toUpperCase().indexOf('PORTAL') === 0) {
			portal_format = path_tokens[i];
	    }
	}
	if(portal_format == null) {
		portal_format = 'portal';
	}
	$.portal_api('getTranslations', portal_format, function() {
		// Translate informative widget first
		if (typeof informativeWidget_configure == 'function') {
			informativeWidget_configure();
		}
		translate($.settings.user.lang);
		translationsAreLoaded = true;
	});

	/* Configure Portal */
	lang_block_configure();
	replaceAllFreeURLs();

	if( handle_force_disconnect() )
	{
		return;
	}

	if( handle_autoconnect( ))
	{
		return;
	}


	/* Configure reserved_block */
	if ($.settings != undefined && $.settings.auth_modes != undefined)
	{
		// Order is important
		securePwdForm_configure();
		autoLogonForm_configure();
		logonForm_configure();
		forceModifyPwdForm_configure();
		feedbackForm_configure();
		modifyPwdForm_configure();
		getPurchaseSummaryForm_configure();
		upgradeAccountForm_configure();
		manageAccountForm_configure();

		smsSubscriptionForm_configure();
		mailSubscriptionForm_configure();
		oneSubscriptionForm_configure();
		directSubscriptionForm_configure();
		printSubscriptionForm_configure();
		paypalSubscriptionForm_configure();
		ogoneSubscriptionForm_configure();
		ppsSubscriptionForm_configure();

		paypalPaymentForm_configure();
		ogonePaymentForm_configure();
		pmsPaymentForm_configure();

		pwdRecoveryForm_configure();
		pwdRecoverySetForm_configure();

		accountRefillForm_configure();

		shibAuthenticated();

		// Analize step
		displayStep();
	}
}

/* Display the portal accordingly to its step or configuration */
function displayStep() {

	if ( ! handleCentralPortalRedirection()) {
		return;
	}

	/* Display right block */
	securePwdForm_display();
	autoLogonForm_display();
	logonForm_display();
	forceModifyPwdForm_display();
	feedbackForm_display();
	modifyPwdForm_display();
	getPurchaseSummaryForm_display();
	upgradeAccountForm_display();
	manageAccountForm_display();

	smsSubscriptionForm_display();
	mailSubscriptionForm_display();
	oneSubscriptionForm_display();
	directSubscriptionForm_display();
	printSubscriptionForm_display();
	paypalSubscriptionForm_display();
	ogoneSubscriptionForm_display();
	ppsSubscriptionForm_display();

	paypalPaymentForm_display();
	ogonePaymentForm_display();
	pmsPaymentForm_display();

	pwdRecoveryForm_display();
	pwdRecoverySetForm_display();

	logonFormSubscribeChoice_display(false);

	// Widgets
	if (typeof informativeWidget_display == 'function')
	{
		informativeWidget_display();
	}
	else
	{
		// Display reserved_block slowly
		$('#reserved_block').fadeIn('slow');
	}
}

/** Handles central portal redirection to post credentials on the local
 * controller
 */
function handleCentralPortalRedirection() {

	if($.settings.user.login_URL_params != undefined && ($.settings.user.isConnected == undefined || $.settings.user.isConnected != true)) {
		      displayWaitingIcon(true);
		return buildRedirectionURL($.settings.user.login_URL_params);

	}

	return true;

}

function buildRedirectionURL(url_params) {

	/* When we are a central controller, we need to redirect the client to his
	 * local controller (AKA remote controller)
	 * This creates a temporary form populated with the client's credentials
	 * The form is submitted to the URL given by the remote controller
	 * According to
	 * http://stackoverflow.com/questions/3770324/jquerys-form-submit-not-working-in-ie/6694054#6694054
	 * it only works this way on IE 9
	 */
	if (url_params != undefined) {

		var target_URL;
		var port = '443';
		var protocol = 'https';
		var host = '';
		var uri = '';

		if (url_params.url != undefined) {
			target_URL = url_params.url;
		}
		else {

			if (url_params.host != undefined) {
				host = url_params.host;
			}
			if (url_params.port != undefined) {
				port = url_params.port;
			}
			if (url_params.protocol != undefined) {
				protocol = url_params.protocol;
			}
			if (url_params.uri != undefined) {
				uri = url_params.uri;
			}

			target_URL = protocol + '://' + host + ':' + port + '/' + uri;

		}

		var parameters = url_params.parameters;
		var send_cna_id = $.portal_api('isInAutoConnect');
		var cna_id = $.portal_api('getCnaId');
		if (send_cna_id == true && cna_id != null) {
			if (parameters === undefined) {
				parameters = new Object();
			}
			parameters.cna_id = cna_id;
		}
		if ($('form[name="logonForm"] input[name="wispr_mode"]').is(':checked')) {
			parameters.wispr_mode = 'true';
		}

		if (url_params.type != undefined && url_params.type == "POST") {
			var form = document.createElement("form");
			$(form).attr("action", target_URL);
			$(form).attr("method", "POST");
			if (parameters != undefined) {
				$.each(parameters, function(index, value) {
					$(form).append('<input name="' + index + '" value="' + value + '">');
				});
			}
			document.body.appendChild(form);
			$(form).submit();
			document.removeChild(form);
			return false;

		}
		else { /* GET */
			if (parameters != undefined) {
				var get_params = (target_URL.indexOf('?') == -1) ? '?' : '&';
				$.each(parameters, function(index, value) {
					get_params += index + '=' + value + '&';
				});

				get_params = get_params.substr(0, get_params.length - 1);

				target_URL += get_params;

			}

			window.location = target_URL;
			return false;
		}
	}
}

/* Display and translate all the error or information message on top of the reserved_block */
function displayErrorInfo(displayLang) {
	if (displayLang == undefined) {
		if ($.settings != undefined && $.settings.user != undefined) {
			displayLang = $.settings.user.lang;
		}
	}

	if ($.settings != undefined) {
		var lang = $.translations;

		if ($.settings.error != undefined ) {
			// This exception indicate that user maybe attempt to bypass controller portal zone redirection
			if ($.settings.error.code == "error_redirect-to-index" && $.settings.redirect != undefined) {
				window.location = $.settings.redirect;
			}

			$('#error_info_value').text($.settings.error.code).removeClass("info").addClass("error");
			// Use a better query or xpath
			$(lang).find('error').each(function() {
				var error = $(this);
				$(this).find('msgid').each(function() {
					var id = $(this).text();
					if (id == $.settings.error.code) {
						var trans = error.find(displayLang).text();
						if (trans == "") {
							trans = error.find($.settings.lang.defaultLang).text();
						}
						if (trans != "") {
							// For custom fields name in the error message
							var subscription_modes = new Array("direct", "mail", "sms", "paypal", "ogone", "one", "print"); // Differents subscription mode where custom fields are available
							var custom_field_error = false;

							var creationMode = undefined;
							if ($.settings.error.code.indexOf("error_personal-settings") > -1) {
								var creationModeRegExp = new RegExp("^portal-([a-zA-Z]+)$");
								var creationModeMatches = creationModeRegExp.exec($.settings.user.creationMode.value);
								if (creationModeMatches != undefined) {
									creationMode = creationModeMatches[1];
								}
							}

							for (key in subscription_modes) {
								var subscription_mode = subscription_modes[key];
								if ( ($.settings.error.code == "error_" + subscription_mode + "-subscribe_no-custom-field")
										|| (creationMode != undefined && $.settings.error.code.indexOf("no-custom-field") > -1 && subscription_mode == creationMode)
										|| ($.settings.error.code == 'error_subscribe_no-custom-field' && $.settings.subscribe[subscription_mode] != undefined)) {

									custom_field_error = true;
									if ($.settings.subscribe[subscription_mode][$.settings.error.value].labels[displayLang] != undefined) {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value].labels[displayLang]));
									}
									else if ($.settings.subscribe[subscription_mode][$.settings.error.value].labels[$.settings.lang.defaultLang] != undefined) {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value].labels[$.settings.lang.defaultLang]));
									}
									else {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value].labels[$.settings.lang.customFieldsDefaultLang]));
									}
									break;
								}
								else if ( ($.settings.error.code == "error_" + subscription_mode + "-subscribe_invalid-custom-field")
										|| (creationMode != undefined && $.settings.error.code.indexOf("invalid-custom-field") > -1 && subscription_mode == creationMode)
										|| ($.settings.error.code == 'error_subscribe_invalid-custom-field' && $.settings.subscribe[subscription_mode] != undefined)) {

									custom_field_error = true;
									if ($.settings.subscribe[subscription_mode][$.settings.error.value[0]].labels[displayLang] != undefined) {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value[0]].labels[displayLang], $.settings.error.value[1]));
									}
									else if ($.settings.subscribe[subscription_mode][$.settings.error.value[0]].labels[$.settings.lang.defaultLang] != undefined) {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value[0]].labels[$.settings.lang.defaultLang], $.settings.error.value[1]));
									}
									else {
										$('#error_info_value').text($.sprintf(trans, $.settings.subscribe[subscription_mode][$.settings.error.value[0]].labels[$.settings.lang.customFieldsDefaultLang], $.settings.error.value[1]));
									}
									break;
								}
							}

							var error_block;
							for (key in subscription_modes) {
								var subscription_mode = subscription_modes[key];
								if ($.settings.error.code == 'error_' + subscription_mode + '-subscribe_invalid-password') {
									error_block = $('#' + subscription_mode + 'SubscriptionErrorBlock').clone();
									$('#' + subscription_mode + 'SubscriptionErrorBlock_text', error_block).text($.sprintf(trans, ""));
								}
							}
							if (error_block != undefined || $.settings.error.code.indexOf('error_modify-pwd_invalid-password') > -1
									||$.settings.error.code.indexOf('error_force-modify-pwd_invalid-password') > -1) {
								if ($.settings.error.code.indexOf('error_force-modify-pwd_invalid-password') > -1) {
									error_block= $('#forceModifyPwdErrorBlock').clone();
									$("#forceModifyPwdErrorBlock_text", error_block).text($.sprintf(trans, ""));
								}
								else if ($.settings.error.code.indexOf('error_modify-pwd_invalid-password') > -1) {
									var error_block = $('#modifyPwdErrorBlock').clone();
									$("#modifyPwdErrorBlock_text", error_block).text($.sprintf(trans, ""));
								}
								else {
									// subscription cases
									error_block = error_block.clone();
									$('#' + $(error_block).attr('id') + '_text', error_block).text($.sprintf(trans, ""));
								}
								$.each($.settings.error.value, function(index, value) {
									var translation = getErrorTranslation($.settings.error.code + '-' + value.cause, displayLang);
									if (translation == "") {
										translation = getErrorTranslation($.settings.error.code + '-' + value.cause, $.settings.lang.defaultLang);
									}
									switch(value.cause) {
										case "small":
											var error_line = $('li:first', error_block).clone();
											error_line.show();
											error_line.text($.sprintf(translation, value.minimum));
											$('ul:first', error_block).append(error_line);
											break;
										case "big":
											var error_line = $('li:first', error_block).clone();
											error_line.show();
											error_line.text($.sprintf(translation, value.maximum));
											$('ul:first', error_block).append(error_line);
											break;
										case "missing-occurance":
											$.each(value.classes, function(index, char_class) {
												if (char_class.quota > 0) {
													var error_line = $('li:first', error_block).clone();
													error_line.show();
													error_line.text($.sprintf(translation, char_class.quota, char_class.set.join("")));
													$('ul:first', error_block).append(error_line);
												}
											});
											break;
									}
								});
								error_block.show();
								$('#error_info_value').html(error_block);
							}
							else if ($.settings.error.code == 'error_logon_volume-quota-reached-detail') {
								// it's only next renew timestamp in which we have an interest
								if ($.settings.error.value.renewTimeStamp != undefined && $.settings.error.value.zoneOffset != undefined) {
									var data_renew = explodeDate(new Date((parseInt($.settings.error.value.renewTimeStamp) + parseInt($.settings.error.value.zoneOffset)) * 1000)); // Must give date in milliseconds
									var date_renew = $.sprintf(
											getGenericTranslation('full-date-display', displayLang),
											data_renew.year,
											data_renew.monthNumber,
											getGenericTranslation(data_renew.month, displayLang),
											data_renew.dayNumber,
											getGenericTranslation(data_renew.day, displayLang),
											data_renew.hours[24],
											data_renew.minutes,
											data_renew.hours[12],
											data_renew.hours['ext']
									);
									if ($.settings.error.value.isControllerTimezone === false && $.settings.error.value.zoneTimezone != undefined) {
										date_renew += ' (' + $.settings.error.value.zoneTimezone + ')';
									}
									var error_text = $.sprintf(trans, date_renew);
									$('#error_info_value').text(error_text);
								}
								else {
									// rollback error message without renew timestamp if we have an error
									$.settings.error.code = 'error_logon_volume-quota-reached';
								}
							}
							else {
								if (custom_field_error == false) {
									$('#error_info_value').text($.sprintf(trans, $.settings.error.value));
								}
							}
						}
					}
				});
			});
		}
		else if ($.settings.info != undefined) {
			$('#error_info_value').text($.settings.info.code).removeClass("error").addClass("info");
			// Use a better query or xpath
			$(lang).find('info').each(function() {
				var info = $(this);
				$(this).find('msgid').each(function() {
					var id = $(this).text();
					if (id == $.settings.info.code) {
						var trans = info.find(displayLang).text();
						if (trans == "") {
							trans = info.find($.settings.lang.defaultLang).text();
						}
						if (trans != "") {
							$('#error_info_value').text($.sprintf(trans, $.settings.info.value));
						}
					}
				});
			});

		}
		else {
			$('#error_info_value').html('&nbsp;').removeClass("error info");
		}
	}
	else {
		$('#error_info_value').html('&nbsp;').removeClass("error info");
	}
}

function resetErrorInfo() {
	$('#error_info_value').html('&nbsp;').removeClass("error info");
}


/*****************************************************************************/
/***** Communication Functions                                           *****/
/***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** *****/


/** Authenticate an user on the controller
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to connect a user                [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The user's account password                         [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy (boolean)    [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function authenticate( callbacks , params ) {

	var request = new Object();
	request.action = "authenticate";

	if (params == undefined) {
		return false;
	}

	// Check package change
	if ( (params.switchPackage != undefined) && (params.switchPackage == true) ) {
		request.switch_package = params.switchPackage;
		if ($.settings.user.timeCredit != undefined){
			delete $.settings.user.timeCredit;
		}
	}

	if ( ($.settings.step != undefined && $.settings.step == "PAYMENT") && ($.settings.type != undefined && $.settings.type == "PMS") ){
		// Check only login
		if (params.login == undefined) {
			return false;
		}else{
			request.login = params.login;
		}
	}else{
		// Check required parameters
		if ( (params.login == undefined) || (params.password == undefined) ) {
			return false;
		}
		else {
			request.login = params.login;
			request.password = params.password;
		}
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;
	request.policy_accept = params.policyAccept;

	// Let the portal know the request came from AJAX
	request.from_ajax = true;

	// For package change
	if (params.currentProfile != undefined)
		request.new_profile = params.currentProfile;
	if (params.lastProfile != undefined)
		request.last_profile = params.lastProfile;

	// send cna id
	if (params.cna_id != undefined) {
		request.cna_id = params.cna_id;
	}
	// send wispr mode
	if (params.wispr_mode != undefined) {
		request.wispr_mode = params.wispr_mode;
	}

	$.portal_api('action', request, callbacks);
}

/** Authenticate an user on the controller for automatic connection
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to connect a user                [OPTIONAL]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy              [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function autoAuthenticate( callbacks , params ) {

	var request = new Object();
	request.action = "automatic_authenticate";

	// Get optional parameters
	request.secure_pwd = params.securePwd;
	request.policy_accept = params.policyAccept;

	$.portal_api('action', request, callbacks);
}

/** Authenticate an user on the controller for automatic connection
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to connect a user                [NOT USED]
 */
function informativeWidgetAuthenticate( callbacks , params ) {

	var request = new Object();
	request.action = "informativeWidget_authenticate";

	$.portal_api('action', request, callbacks);
}

/** Authenticate an user on with social network credential
 *  Only used to check policy accept
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to connect a user                [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy (boolean)    [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function socialNetworkAuthenticate( callbacks , params ) {

	var request = new Object();
	request.action = "social_network_authenticate";

	if (params == undefined) {
		return false;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;
	request.policy_accept = params.policyAccept;
	if ( params.privatePolicyAccept != undefined ) {
		request.private_policy_accept = params.privatePolicyAccept;
	}
	request.type = params.type;

	if (request.type == 'twitter') {
		request.user_follow = params.userFollow;
	}

	if (request.type == 'facebook') {
		request.user_like = params.userLike;
	}

	$.portal_api('action', request, callbacks);
}

/** Disconnect an user on the controller
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to disconnect a user             [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function disconnect( callbacks , params ) {

	var request = new Object();
	request.action = "disconnect";

	if (params == undefined) {
		return false;
	}

	// Check required parameters
	if ( params.login == undefined ) {
		return false;
	}
	else {
		request.login = params.login;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Refresh the connection of an user on the controller
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to refresh a user                [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function refresh( callbacks , params ) {
	var request = new Object();
	request.action = "refresh";

	if (params == undefined) {
		return false;
	}

	// Check required parameters
	if ( params.login == undefined ) {
		return false;
	}
	else {
		request.login = params.login;
		var currentDate = new Date();
		request.time = currentDate.getTime();
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	if ( ( ($.settings.type == "CONNECT") || ($.settings.type == "REFRESH") ) && ($.settings.user.autoDisconnect != undefined && $.settings.user.autoDisconnect.value != true) ) {
		$.portal_api('action', request, callbacks);
	}
}

/** Request a check of the secure password to know if the user can go further
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to access the portal             [REQUIRED]
 * - securePassword : The portal securization password              [REQUIRED]
 */
function securePwd( callbacks , params ) {

	var request = new Object();
	request.action = "secure_pwd";

	if (params == undefined) {
		return false;
	}

	// Check required parameters
	if (params.securePwd == undefined) {
		return false;
	}
	else {
		request.secure_pwd = params.securePwd;
	}

	$.portal_api('action', request, callbacks);
}

/** Modify the user's account password on the controller (after been connected)
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to modify the user's password    [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The current user's account password                 [REQUIRED]
 * - newPassword : The new account password                         [REQUIRED]
 * - newPasswordConfirm : The new account password confirmation     [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function modifyPwd( callbacks , params ) {

	var request = new Object();
	request.action = "modify_pwd";

	if (params == undefined) {
		return false;
	}

	// Check required parameters
	if ( (params.login == undefined) || (params.password == undefined) || (params.newPassword == undefined) || (params.newPasswordConfirm == undefined) ) {
		return false;
	}
	else {
		request.login = params.login;
		request.password = params.password;
		request.new_password = params.newPassword;
		request.new_password_confirm = params.newPasswordConfirm;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Modify the user's account password on the controller (before been connected)
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to modify the user's password    [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The current user's account password                 [REQUIRED]
 * - newPassword : The new account password                         [REQUIRED]
 * - newPasswordConfirm : The new account password confirmation     [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function forceModifyPwd( callbacks , params ) {

	var request = new Object();
	request.action = "force_modify_pwd";

	if (params == undefined) {
		return false;
	}

	// Check required parameters
	if ( (params.login == undefined) || (params.password == undefined) || (params.newPassword == undefined) || (params.newPasswordConfirm == undefined) ) {
		return false;
	}
	else {
		request.login = params.login;
		request.password = params.password;
		request.new_password = params.newPassword;
		request.new_password_confirm = params.newPasswordConfirm;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Cancel the current action then go back
 * @param callbacks - Callback functions                            [REQUIRED]
 */
function backAction( callbacks ) {

	var request = new Object();
	request.action = "back_action";

	$.portal_api('action', request, callbacks);
}

/** Send the parameters on an user subscribing on the controller
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to create a user account         [REQUIRED]
 * - type : The subcription type                                    [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * + SMS Type
 *   - prefix : The prefix (country code) of the user phone number  [REQUIRED]
 (33 for France, 49 for Germany)
 *   - phone : The user phone number                                [REQUIRED]
 *   - lastName : The user last name                                [REQUIRED]
 *   - firstName : The user first name                              [REQUIRED]
 *   - emailAddress : The user email address                        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - organizationUnitName : The user company name                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalAddress : The user postal address                      [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCode : The user address postal code                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalLocalityName : The user address locality name          [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalPostofficeBox : The user address postoffice box        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalStateOrProvinceName : The user address st. or pr. name [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCountryName : The user address country name            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_1 : First additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_2 : Second additional field                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_3 : Third additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - sponsor_email : The sponsor email                            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - policyAccept : Proove that user agreed the policy            [OPTIONAL, we'll be required if option enabled on portal configuration]
 * + Mail Type
 *   - emailAddress : The user email address                        [REQUIRED]
 *   - prefix : The prefix (country code) of the user phone number  [OPTIONAL, we'll be required if option enabled on portal configuration]
 (33 for France, 49 for Germany)
 *   - phone : The user phone number                                [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - lastName : The user last name                                [REQUIRED]
 *   - firstName : The user first name                              [REQUIRED]
 *   - organizationUnitName : The user company name                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalAddress : The user postal address                      [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCode : The user address postal code                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalLocalityName : The user address locality name          [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalPostofficeBox : The user address postoffice box        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalStateOrProvinceName : The user address st. or pr. name [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCountryName : The user address country name            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_1 : First additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_2 : Second additional field                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_3 : Third additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - sponsor_email : The sponsor email                            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - policyAccept : Proove that user agreed the policy            [OPTIONAL, we'll be required if option enabled on portal configuration]
 * + One type
 * + Direct Type
 * + Print Type
 * + Paypal Type
 * + Ogone Type
 *   - lastName : The user last name                                [REQUIRED]
 *   - firstName : The user first name                              [REQUIRED]
 *   - login : The user's account login                             [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - password : The new account password                          [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - passwordConfirm : The new account password confirmation      [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - prefix : The prefix (country code) of the user phone number  [OPTIONAL, we'll be required if option enabled on portal configuration]
 ( 33 for France, 49 for Germany)
 *   - phone : The user phone number                                [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - emailAddress : The user email address                        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - organizationUnitName : The user company name                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalAddress : The user postal address                      [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCode : The user address postal code                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalLocalityName : The user address locality name          [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalPostofficeBox : The user address postoffice box        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalStateOrProvinceName : The user address st. or pr. name [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCountryName : The user address country name            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_1 : First additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_2 : Second additional field                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_3 : Third additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - sponsor_email : The sponsor email                            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - policyAccept : Proove that user agreed the policy            [OPTIONAL, we'll be required if option enabled on portal configuration]
 * + PPS Type
 *   - scratchCode : Scratch code from prepay card                  [REQUIRED]
 *   - captchaCode : Code from portal display to validate logon     [REQUIRED]
 *   - policyAccept : Proove that user agreed the policy            [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function subscribe( callbacks , params ) {

	var request = new Object();
	request.action = "subscribe";

	if (params == undefined) {
		return false;
	}

	// Check required parameter
	if (params.type == undefined) {
		return false;
	}
	else {
		request.type = params.type;
	}

	switch (params.type) {
		case "sms":
		case "mail":
			// Get parameters for subscription
			request.last_name = params.lastName;
			request.first_name = params.firstName;
			request.email_address = params.emailAddress;
			request.prefix = params.prefix;
			request.phone = params.phone;
			request.policy_accept = params.policyAccept;
			request.organizational_unit_name = params.organizationalUnitName;
			// Postal address
			request.postal_address = params.postalAddress;
			request.postal_code = params.postalCode;
			request.postal_locality_name = params.postalLocalityName;
			request.postal_postoffice_box = params.postalPostofficeBox;
			request.postal_state_or_province_name = params.postalStateOrProvinceName;
			request.postal_country_name = params.postalCountryName;

			request.personal_field_1 = params.personalField_1;
			request.personal_field_2 = params.personalField_2;
			request.personal_field_3 = params.personalField_3;

			request.sponsor_email = params.sponsorEmail;
			request.gender = params.gender;
			request.birth_date = params.birthDate;
			request.user_language = params.userLanguage;
			request.interests = params.interests;
			break;

		case "one":
			request.connect_policy_accept = params.connectPolicyAccept;
		case "direct":
		case "print":
		case "paypal":
		case "ogone":
			// Get parameters for subscription
			request.user_login = params.login;
			request.user_password = params.password;
			request.user_password_confirm = params.passwordConfirm;
			request.last_name = params.lastName;
			request.first_name = params.firstName;
			request.email_address = params.emailAddress;
			request.prefix = params.prefix;
			request.phone = params.phone;
			request.policy_accept = params.policyAccept;
			request.organizational_unit_name = params.organizationalUnitName;
			// Postal address
			request.postal_address = params.postalAddress;
			request.postal_code = params.postalCode;
			request.postal_locality_name = params.postalLocalityName;
			request.postal_postoffice_box = params.postalPostofficeBox;
			request.postal_state_or_province_name = params.postalStateOrProvinceName;
			request.postal_country_name = params.postalCountryName;

			request.personal_field_1 = params.personalField_1;
			request.personal_field_2 = params.personalField_2;
			request.personal_field_3 = params.personalField_3;

			request.sponsor_email = params.sponsorEmail;
			request.gender = params.gender;
			request.birth_date = params.birthDate;
			request.user_language = params.userLanguage;
			request.interests = params.interests;
			break;

		case "pps":
			// Get parameters for pps subscription
			request.scratch_code = params.scratchCode;
			request.captcha_code = params.captchaCode;
			request.policy_accept = params.policyAccept;
			break;

		default:
			return false;
			break;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Select PMS package for user
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to select a PMS package          [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - package : The package choosen by user                          [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy              [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function selectPmsPackage( callbacks , params ) {

	var request = new Object();
	request.action = "select_pms_package";

	if (params == undefined) {
		return false;
	}

	if ($.settings.payment == undefined) {
		return false;
	}

	request.login = $.settings.payment.login;
	if ( (switch_package != undefined) && (switch_package == true) ) {
		request.switch_package = switch_package;
	}else{
		request.secure_pwd = $.settings.payment.securePwd;
		request.policy_accept = $.settings.payment.policyAccept;
	}

	request.package = params.package;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Select Paypal package for user
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to select a Paypal package       [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The current user's account password                 [REQUIRED]
 * - package : The package choosen by user                          [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy              [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function selectPaypalPackage( callbacks , params ) {

	var request = new Object();
	request.action = "select_paypal_package";

	if (params == undefined) {
		return false;
	}

	if ($.settings.payment == undefined) {
		return false;
	}
	request.login = $.settings.payment.login;
	request.process = $.settings.payment.process;
	request.secure_pwd = $.settings.payment.securePwd;
	request.policy_accept = $.settings.payment.policyAccept;
	request.package = params.package;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Select Ogone package for user
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to select an Ogone package       [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The current user's account password                 [REQUIRED]
 * - package : The package choosen by user                          [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 * - policyAccept : Proove that user agreed the policy              [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function selectOgonePackage( callbacks , params ) {

	var request = new Object();
	request.action = "select_ogone_package";

	if (params == undefined) {
		return false;
	}

	if ($.settings.payment == undefined) {
		return false;
	}
	request.login = $.settings.payment.login;
	request.process = $.settings.payment.process;
	request.secure_pwd = $.settings.payment.securePwd;
	request.policy_accept = $.settings.payment.policyAccept;
	request.package = params.package;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Send Paypal subscription credential to user email or sms
 * @param callbacks - Callback functions                                     [REQUIRED]
 * @param params - The params used to send Paypal credentials by Mail or Sms [REQUIRED]
 * - action : The mode used to send credentials                              [REQUIRED]
 (paypal_send_sms for sms, paypal_send_mail for mail)
 * - login : The user's account login                                        [REQUIRED]
 * - password : The current user's account password                          [REQUIRED]
 * - email : The user email address                                          [REQUIRED, for mail action]
 * - prefix : The prefix (country code) of the user phone number             [REQUIRED, for sms action]
 (33 for France, 49 for Germany)
 * - phone : The user phone number                                           [REQUIRED, for sms action]
 * - securePwd : The portal securization password                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function subscriptionSendCredential( callbacks , params ) {

	var request = new Object();

	if (params == undefined) {
		return false;
	}

	request.action = params.action;
	request.login = params.login;
	request.password = params.password;
	request.prefix = params.prefix;
	request.phone = params.phone;
	request.email = params.email;

	// Get optional parameters
	request.secure_pwd = params.securePwd;
	$.portal_api('action', request, callbacks);
}

/** Send Paypal subscription SMS to user phone
 * @param callbacks - Callback functions                             [REQUIRED]
 * @param params - The params used to send Paypal credentials by SMS [REQUIRED]
 * - login : The user's account login                                [REQUIRED]
 * - password : The current user's account password                  [REQUIRED]
 * - prefix : The prefix (country code) of the user phone number     [REQUIRED]
 (33 for France, 49 for Germany)
 * - phone : The user phone number                                   [REQUIRED]
 * - securePwd : The portal securization password                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function paypalSendSms( callbacks , params ) {

	var request = new Object();
	request.action = "paypal_send_sms";

	if (params == undefined) {
		return false;
	}

	request.login = params.login;
	request.password = params.password;
	request.prefix = params.prefix;
	request.phone = params.phone;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Send Ogone subscription SMS to user phone
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to send Ogone credentials by SMS [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The current user's account password                 [REQUIRED]
 * - prefix : The prefix (country code) of the user phone number    [REQUIRED]
 (33 for France, 49 for Germany)
 * - phone : The user phone number                                  [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function ogoneSendSms( callbacks , params ) {

	var request = new Object();
	request.action = "ogone_send_sms";

	if (params == undefined) {
		return false;
	}

	request.login = params.login;
	request.password = params.password;
	request.prefix = params.prefix;
	request.phone = params.phone;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Request portal API after return from  Ogone/Paypal payment page
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to confirm payment type  [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - password : The user's account login                               [REQUIRED]
 * - type : payment type					[REQUIRED]
 */
function verifyPayment( callbacks , params ) {

	var request = new Object();

	if (params == undefined) {
		return false;
	}

	request.action = "verify_payment";
	request.login = params.login;
	request.process = $.settings.payment.process;
	request.type = $.settings.payment.type;
	$.portal_api('action', request, callbacks);
}


/** Request portal API after pay button pushed for Ogone portal
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to confirm Ogone package choice  [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - orderid : ...
 */
function ogoneSubmitPayment( callbacks , params ) {

	var request = new Object();
	request.action = "ogone_submit_payment";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;
	request.orderid = params.orderid;
	request.password = params.password;
	request.package = $.settings.payment.package;
	request.process = $.settings.payment.process;
	$.portal_api('action', request, callbacks);
}

/** Request portal API after pay button pushed for Ogone portal
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to confirm Ogone package choice  [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - orderid : ...
 */
function paypalSubmitPayment( callbacks , params ) {

	var request = new Object();
	request.action = "paypal_submit_payment";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;
	request.password = params.password;
	request.package = $.settings.payment.package;
	request.process = $.settings.payment.process;
	$.portal_api('action', request, callbacks);
}

/** Request portal API on feedback to have a purchase summary
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to get a purchase summary        [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function getPurchaseSummary( callbacks , params ) {

	var request = new Object();
	request.action = "get_purchase_summary";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Request portal API on feedback to have the current package settings
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to get the current user package  [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function getCurrentPackage( callbacks , params ) {

	var request = new Object();
	request.action = "get_current_package";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Request portal API on feedback to create a new upgrade order (allowing new multidevice sessions)
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to create a new upgrade order    [REQUIRED]
 * - login : The user's account login                               [REQUIRED]
 * - multidevice : The number of simultaneous sessions wanted       [REQUIRED]
 * - securePwd : The portal securization password                   [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function getUpgradeOrder( callbacks , params ) {

	var request = new Object();
	request.action = "get_upgrade_order";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;
	request.multidevice = params.multidevice;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Request portal API on feedback to update status of an existing order
 * @param callbacks - Callback functions                               [REQUIRED]
 * @param params - The params used to update an existing upgrade order [REQUIRED]
 * - login : The user's account login                                  [REQUIRED]
 * - orderId : The order ID                                            [REQUIRED]
 * - securePwd : The portal securization password                      [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function updateUpgradeOrder( callbacks , params ) {

	var request = new Object();
	request.action = "update_upgrade_order";

	if (params == undefined) {
		return false;
	}
	request.login   = params.login;
	request.order_id = params.orderId;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Request portal API on feedback to check an existing order triggering modification account or not
 * @param callbacks - Callback functions                              [REQUIRED]
 * @param params - The params used to check an existing upgrade order [REQUIRED]
 * - login : The user's account login                                 [REQUIRED]
 * - securePwd : The portal securization password                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function checkUpgradeOrder( callbacks , params ) {

	var request = new Object();
	request.action = "check_upgrade_order";

	if (params == undefined) {
		return false;
	}
	request.login = params.login;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Switch display from current language to choosen one
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to change the display language   [REQUIRED]
 * - language : The required display language                       [REQUIRED]
 */
function switchLanguage( callbacks , params ) {

	var request = new Object();
	request.action = "switch_language";
	request.isAppleCNA_fakeclick = isAppleCNA ? isAppleCNA_fakeclick : false;

	isAppleCNA_fakeclick = false;

	if (params == undefined) {
		return false;
	}

	request.lang = params.language;

	$.portal_api('action', request, callbacks);
}

/** Push new personal information regarding the user account
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to update user personal settings [OPTIONAL]
 *   - lastName : The user last name                                [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - firstName : The user first name                              [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - prefix : The prefix (country code) of the user phone number  [OPTIONAL, we'll be required if option enabled on portal configuration]
 ( 33 for France, 49 for Germany)
 *   - phone : The user phone number                                [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - emailAddress : The user email address                        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - organizationUnitName : The user company name                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalAddress : The user postal address                      [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCode : The user address postal code                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalLocalityName : The user address locality name          [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalPostofficeBox : The user address postoffice box        [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalStateOrProvinceName : The user address st. or pr. name [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - postalCountryName : The user address country name            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_1 : First additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_2 : Second additional field                    [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - personalField_3 : Third additional field                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - sponsor_email : The sponsor email                            [OPTIONAL, we'll be required if option enabled on portal configuration]
 *   - securePwd : The portal securization password                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function updatePersonalSettings( callbacks , params ) {

	var request = new Object();
	request.action = "personal_settings_update";

	if (params == undefined) {
		return false;
	}

	request.last_name = params.lastName;
	request.first_name = params.firstName;
	request.email_address = params.emailAddress;
	request.prefix = params.prefix;
	request.phone = params.phone;
	request.organizational_unit_name = params.organizationalUnitName;
	// Postal address
	request.postal_address = params.postalAddress;
	request.postal_code = params.postalCode;
	request.postal_locality_name = params.postalLocalityName;
	request.postal_postoffice_box = params.postalPostofficeBox;
	request.postal_state_or_province_name = params.postalStateOrProvinceName;
	request.postal_country_name = params.postalCountryName;

	request.personal_field_1 = params.personalField_1;
	request.personal_field_2 = params.personalField_2;
	request.personal_field_3 = params.personalField_3;

	request.sponsor_email = params.sponsorEmail;
	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Push new comments regarding the user account linked devices
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to manage user devices           [REQUIRED]
 */
function updateDevicesSettings( callbacks , params ) {

	var request = params; //new Object();
	request.action = "devices_settings_update";

	$.portal_api('action', request, callbacks);
}

/** Push new answers/questions regarding the password recovery feature
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used by the password recovery feature [REQUIRED]
 */
function updatePwdRecoverySecretQuestions( callbacks , params ) {

	var request = params; //new Object();
	request.secure_pwd = params.securePwd;
	request.action = "pwd_recovery_secret_questions_update";

	$.portal_api('action', request, callbacks);
}

/** Get user account and password recovery options according to the given settings
 * @param callbacks - Callback functions                                [REQUIRED]
 * @param params - The params used to retreive an existing user account [REQUIRED]
 *   - login : The user's account login                                 [OPTIONAL]
 *   - prefix : The prefix (country code) of the user phone number      [OPTIONAL]
 ( 33 for France, 49 for Germany)
 *   - phone : The user phone number                                    [OPTIONAL]
 *   - emailAddress : The user email address                            [OPTIONAL]
 *   - securePwd : The portal securization password                     [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function getPwdRecoveryOptionsFromUser( callbacks , params ) {

	var request = new Object();
	request.action = "get_pwd_recovery_options_from_user";

	if (params == undefined) {
		return false;
	}

	request.login = params.login;
	request.email_address = params.emailAddress;
	request.prefix = params.prefix;
	request.phone = params.phone;

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Send a new user's password by SMS
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to send a new user's password    [REQUIRED]
 *   - securePwd : The portal securization password                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function regenPwdWithSmsResend( callbacks , params ) {

	var request = new Object();
	request.action = "regen_pwd_with_sms_resend";

	if (params == undefined) {
		return false;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Send a new user's password by email
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to send a new user's password    [REQUIRED]
 *   - securePwd : The portal securization password                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function regenPwdWithEmailResend( callbacks , params ) {

	var request = new Object();
	request.action = "regen_pwd_with_email_resend";

	if (params == undefined) {
		return false;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Return a new user's password on the portal
 * @param callbacks - Callback functions                            [REQUIRED]
 * @param params - The params used to send a new user's password    [REQUIRED]
 *   - securePwd : The portal securization password                 [OPTIONAL, we'll be required if option enabled on portal configuration]
 */
function regenPwdWithSecretQuestions( callbacks , params ) {

	var request = params; //new Object();
	request.action = "regen_pwd_with_secret_questions";

	if (params == undefined) {
		return false;
	}

	// Get optional parameters
	request.secure_pwd = params.securePwd;

	$.portal_api('action', request, callbacks);
}

/** Replace href attribute if URL is a free access URL
*/
function replaceAllFreeURLs() {

	if ($.settings != undefined && $.settings.freeUrls != undefined) {
		$('a').each(function() {
			for (freeUrlKey in $.settings.freeUrls) {
				if (freeUrlKey == $(this).attr('href')) {
					$(this).attr('href', $.settings.freeUrls[freeUrlKey]);
				}
			}
		});
	}
}

function shibAuthenticated(){
	if(! $.settings.user.isAuthenticatedThroughShibboleth){
		return;
	}
	$.settings.user.isAuthenticatedThroughShibboleth = false;
	var params = new Object();
	params.login = "shibuser";
	params.password = "shibpwd";
	params.policyAccept = true;
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() {logonFormWaiting(true);};
	callbacks.success    = function() {logonFormConnectCallback();};
	callbacks.complete   = function() {logonFormWaiting(false);};

	authenticate(callbacks, params);
}

function refillAccountPaymentSubscribe( callbacks , params ) {

	var request = new Object();
	request.action = "refill_payment_subscribe";

	if (params == undefined) {
		return false;
	}

	request.login    = params.login;
	request.type     = params.type;
	request.password = params.password;
	request.package  = params.package;

	$.portal_api('action', request, callbacks);
}

/** Request portal API to check refill code and change account options
 * @param callbacks - Callback functions                              [REQUIRED]
 * @param params - The params used to check an existing upgrade order [REQUIRED]
 * - login : The user's account login                                 [REQUIRED]
 * - refillCode : The refill code to use                              [REQUIRED]
 */
function refillAccount( callbacks , params ) {

	var request = new Object();
	request.action = "refill_account";

	if (params == undefined) {
		return false;
	}

	request.login      = params.login;
	request.refillCode = params.refillCode;
	request.password   = params.password;

	if (params.process != undefined) {
		request.process = params.process;
	}

	$.portal_api('action', request, callbacks);
}

/** Request portal API to generate free refill code and change account options
 * @param callbacks - Callback functions                              [REQUIRED]
 * @param params - The params used to check an existing upgrade order [REQUIRED]
 * - login : The user's account login                                 [REQUIRED]
 * - password : user password                                         [REQUIRED]
 * - package : The option used to generate code                       [REQUIRED]
 */
function getFreeRefillCode( callbacks , params ) {

	var request = new Object();
	request.action = "get_free_refill_code";

	if (params == undefined) {
		return false;
	}

	request.login    = params.login;
	request.password = params.password;
	request.package  = params.package;

	if (params.process != undefined) {
		request.process = params.process;
	}

	$.portal_api('action', request, callbacks);
}

/*****************************************************************************/

/** Find all known translations into XML file and replace them in display according to choosen language
 * @param displayLang : Language in which to translate              [OPTIONAL]
 */
function translate(displayLang) {
	if (displayLang == undefined) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}

	var lang = $.translations;

	/* From translations file */
	// Translate title
	$(lang).find('title:eq(0)').each(function() {
		var trans = $(this).find(displayLang).text();
		if (trans == "") {
			trans = $(this).find($.settings.lang.defaultLang).text();
		}
		document.title = trans;
	});
	// Translate texts
	$(lang).find('text').each(function() {
		var trans = $(this).find(displayLang).text();
		if (trans == "") {
			trans = $(this).find($.settings.lang.defaultLang).text();
		}
		$(this).find('msgid').each(function() {
			var id = $(this).text();
			$('#' + id).text(trans);
		});
	});
	// Translate buttons
	$(lang).find('button').each(function() {
		var trans = $(this).find(displayLang).text();
		if (trans == "") {
			trans = $(this).find($.settings.lang.defaultLang).text();
		}
		$(this).find('msgid').each(function() {
			var id = $(this).text();
			var needTranslate = false;
			$('#' + id).contents().filter(function() {
			    if(this.nodeType === 3) {//Node.TEXT_NODE
				needTranslate = true;
			    }
			});
			if(needTranslate) {
			    $('#' + id).text(trans); // old code
			}
		});
	});
	// Translate attribute
	$(lang).find('attribute').each(function() {
		var attribute = $(this);
		$(attribute).find('msgid').each(function() {
			var id = $(this).text();
			$(attribute).find('title').each(function() {
				var trans = $(this).find(displayLang).text();
				if (trans == "") {
					trans = $(this).find($.settings.lang.defaultLang).text();
				}
				$('#' + id).attr("title", trans);
			});
		});
	});

	/* From configuration */
	// Translate phone help
	subscriptionForm_phoneHelpBlock_configure(displayLang);
	paypalSubscriptionResultForm_phoneHelpBlock_configure(displayLang);
	ogoneSubscriptionResultForm_phoneHelpBlock_configure(displayLang);
	pwdRecoveryForm_phoneHelpBlock_configure(displayLang);
	manageAccountForm_personal_settings_phoneHelpBlock_configure(displayLang);

	// Translate policies
	logonForm_policy_configure(displayLang);
	autoLogonForm_policy_configure(displayLang);
	subscriptionForm_policy_configure(displayLang, 'one');
	oneSubscriptionForm_connect_policy_configure(displayLang);
	subscriptionForm_policy_configure(displayLang, 'direct');
	subscriptionForm_policy_configure(displayLang, 'print');
	subscriptionForm_policy_configure(displayLang, 'mail');
	subscriptionForm_policy_configure(displayLang, 'sms');
	subscriptionForm_policy_configure(displayLang, 'paypal');
	subscriptionForm_policy_configure(displayLang, 'ogone');
	subscriptionForm_policy_configure(displayLang, 'pps');

	logonForm_privatePolicy_configure(displayLang, 'facebook');
	logonForm_privatePolicy_configure(displayLang, 'twitter');
	logonForm_privatePolicy_configure(displayLang, 'linkedin');
	logonForm_privatePolicy_configure(displayLang, 'google');

	// Translate custom fields
	subscriptionForm_customFields_configure(displayLang, 'direct');
	subscriptionForm_customFields_configure(displayLang, 'one');
	subscriptionForm_customFields_configure(displayLang, 'print');
	subscriptionForm_customFields_configure(displayLang, 'paypal');
	subscriptionForm_customFields_configure(displayLang, 'ogone');
	subscriptionForm_customFields_configure(displayLang, 'mail');
	subscriptionForm_customFields_configure(displayLang, 'sms');
	manageAccountForm_personal_settings_customFields_configure(displayLang);

	// Translate packages
	pmsPaymentForm_packages_configure(displayLang);
	paypalPaymentForm_packages_configure(displayLang);
	paypalPaymentForm_packages_describe(displayLang);
	ogonePaymentForm_packages_configure(displayLang);
	ogonePaymentForm_packages_describe(displayLang);
	accountRefillForm_options_configure(displayLang);
	accountRefillForm_options_describe(displayLang);
	pmsPaymentForm_packages_describe(displayLang);
	upgradeAccountForm_fillIn(displayLang);

	// Translate feedback
	feedbackForm_fillIn(displayLang);
	pwdRecoverySetForm_questionsTranslate(displayLang);
	pwdRecoveryResendForm_questionsTranslate(displayLang);

	//Translate password helpblock
	forceModifyPwdForm_HelpBlock_configure(displayLang);
	modifyPwdForm_HelpBlock_configure(displayLang);
	subscriptionForm_passwordHelpBlock_configure(displayLang, 'print');
	subscriptionForm_passwordHelpBlock_configure(displayLang, 'direct');
	subscriptionForm_passwordHelpBlock_configure(displayLang, 'one');
	subscriptionForm_passwordHelpBlock_configure(displayLang, 'ogone');
	subscriptionForm_passwordHelpBlock_configure(displayLang, 'paypal');

	/* From custom adds (editor or export) */
	// Translate custom blocks
	// Custom blocks from editor have the lang attribute defined
	$('#body div[lang][id]').each(function() {
		$(this).hide();
	});
	$('#body div[lang="' + displayLang + '"][id]').each(function() {
		$(this).show();
	});

	// Translate error/info message
	displayErrorInfo(displayLang);

	// Switching text direction
	if (displayLang == 'ar') {
		$('body').attr('dir', "rtl");
		$('#lang_block').attr('dir', 'ltr'); // force language bar direction (left to right) to not change language order
	}
	else {
		$('body').attr('dir', "ltr");
	}
}

/** Find and return a generic label translation stored into XML file according to choosen language
 * @param label : The label to search translation                   [REQUIRED]
 * @param displayLang : Language in which to translate              [OPTIONAL]
 * @param plural : Return plural label translation                  [OPTIONAL]
 */
function getGenericTranslation(label, displayLang, plural) {

	var trans = "";

	if (displayLang == undefined || displayLang == null) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}

	var lang = $.translations;
	$(lang).find('generic').each(function() {
		var trans_label = $(this).find('label').text();
		if (label == trans_label) {
			if (plural == true) {
				trans = $(this).find('plural > ' + displayLang).text();
				if (trans == "") {
					trans = $(this).find('plural > ' + $.settings.lang.defaultLang).text();
				}
			}
			else {
				trans = $(this).find('> ' + displayLang).text();
				if (trans == "") {
					trans = $(this).find($.settings.lang.defaultLang).text();
				}
			}
		}
	});
	return trans;
}

/** Find and return an error translation stored into XML file according to choosen language
 * @param id : The id of the error to translate                     [REQUIRED]
 * @param displayLang : Language in which to translate              [OPTIONAL]
 */
function getErrorTranslation(id, displayLang) {

	var trans = "";

	if (displayLang == undefined || displayLang == null) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}

	var lang = $.translations;
	$(lang).find('error').each(function() {
		var msg_found = false;
		$(this).find('msgid').each(function() {
			var trans_id = $(this).text();
			if (id == trans_id) {
				msg_found = true;
				return false;
			}
		});
		if (msg_found) {
			trans = $(this).find(displayLang).text();
			if (trans == "") {
				trans = $(this).find($.settings.lang.defaultLang).text();
			}
		}
	});
	return trans;
}

/** Find and return a input translation stored into XML file according to choosen language
 * @param id : The id of the input to translate                     [REQUIRED]
 * @param displayLang : Language in which to translate              [OPTIONAL]
 */
function getInputTranslation(id, displayLang) {

	var trans = "";

	if (displayLang == undefined || displayLang == null) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}

	var lang = $.translations;
	$(lang).find('input').each(function() {
		var trans_id = $(this).find('msgid').text();
		if (id == trans_id) {
			trans = $(this).find(displayLang).text();
			if (trans == "") {
				trans = $(this).find($.settings.lang.defaultLang).text();
			}
		}
	});
	return trans;
}

/** Find and return a text translation stored into XML file according to choosen language
 * @param id : The id of the input to translate                     [REQUIRED]
 * @param displayLang : Language in which to translate              [OPTIONAL]
 */
function getTextTranslation(id, displayLang) {

	var trans = "";

	if (displayLang == undefined || displayLang == null) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}

	var lang = $.translations;
	$(lang).find('text').each(function() {
		var trans_id = $(this).find('msgid').text();
		if (id == trans_id) {
			trans = $(this).find(displayLang).text();
			if (trans == "") {
				trans = $(this).find($.settings.lang.defaultLang).text();
			}
		}
	});
	return trans;
}

/** Return translation of policy object according to choosen language
 * @param obj : Policy object                                       [REQUIRED]
 * @param lang : Choosen language                                   [OPTIONAL]
 */
function extractPolicyText(obj, lang) {
	var policy = "";
	var link;
	var text;

	if (obj != undefined && obj.policy != undefined && obj.policy.display == true) {
	    if(lang != undefined && obj.policy[lang] != undefined) {
		text = obj.policy[lang].text;
		link = obj.policy[lang].link;
	    }
	    else if(obj.policy.defaultLang != undefined && obj.policy[obj.policy.defaultLang] != undefined) {
		text = obj.policy[obj.policy.defaultLang].text;
		link = obj.policy[obj.policy.defaultLang].link;
	    }
	    else if($.settings.lang.defaultLang != undefined && obj.policy[$.settings.lang.defaultLang] != undefined) {
		text = obj.policy[$.settings.lang.defaultLang].text;
		link = obj.policy[$.settings.lang.defaultLang].link;
	    }

	    if (link != undefined) {
		policy = '<a target="_blank" href="' + link + '">' + text + '</a>';
	    }
	    else {
		policy = text;
	    }
	}

	return policy;
}

/** Start user refresh connection action at interval
*/
function startRefresh() {
	if (refreshObj.ressource == undefined) {
		refreshObj.ressource = window.setInterval(function(){doRefresh();}, refreshObj.refreshInterval);
	}
}

/** Stop user refresh connection action
*/
function stopRefresh() {
	if (refreshObj.ressource != undefined) {
		window.clearInterval(refreshObj.ressource);
	}
	refreshObj = new Object();
}

/** Send refresh connection request to controller
*/
function doRefresh() {
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { refreshCallback(); };
	// callbacks.complete   = function() {}; // TODO

	refresh(callbacks, refreshObj);
}

/** Callback function of doRefresh function
*/
function refreshCallback() {

	displayErrorInfo();
	if ($.settings.error != undefined) {
		stopRefresh();
		/// TODO complete cases
		feedbackFormDisconnect();
		//displayStep();
	}
}

/** Clear user settings stored in javascript variables
*/
function clearUserSettings() {
	if ($.settings != undefined && $.settings.user != undefined) {
		var lang = $.settings.user.lang;
		if ($.settings.user.securePwd != undefined) {
			var securePwd = $.settings.user.securePwd.value;
		}
		delete $.settings.user;
		$.settings.user = new Object();
		$.settings.user.lang = lang;
		if (securePwd != undefined) {
			$.settings.user.securePwd = new Object();
			$.settings.user.securePwd.value = securePwd;
		}
		// clean user pms optional fields information
		if ($.settings.pmsoptionalfields != undefined) {
			delete $.settings.pmsoptionalfields;
		}
	}
}

/** Clear user settings stored in javascript variables
*/
function clearPaymentSettings() {
	if ($.settings != undefined && $.settings.payment != undefined && $.settings.payment.status != undefined) {
		if ($.settings.payment.status == "completed") {
			delete $.settings.payment;
			$.settings.payment = new Object();
		}
	}
}

/** Explode Javascript Date object into usable values
 * @param date : Javascript date object to explode                  [REQUIRED]
 */
function explodeDate(date) {
	var result = new Object();

	result.year = date.getFullYear(); // 4 digits year
	result.monthNumber = date.getMonth() + 1; // getMonth (0-11). January is 0, February is 1, and so on.
	var months = new Array('january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december');
	result.month = months[date.getMonth()];
	result.dayNumber = date.getDate(); // (1-31)
	var days = new Array('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
	result.day = days[date.getDay()]; // getDate (0-6). Sunday is 0, Monday is 1, and so on.
	result.hours = new Array();
	result.hours[24] = date.getHours(); // (0-23)
	if (date.getHours() == 0) {
		result.hours[12] = "12";
		result.hours['ext'] = "am";
	}
	else if (date.getHours() == 12) {
		result.hours[12] = date.getHours();
		result.hours['ext'] = "pm";
	}
	else if (date.getHours() > 12) {
		result.hours[12] = date.getHours() - 12;
		result.hours['ext'] = "pm";
	}
	else {
		result.hours[12] = date.getHours();
		result.hours['ext'] = "am";
	}
	result.minutes = date.getMinutes(); // (0-59)
	result.seconds = date.getSeconds(); // (0-59)

	return result;
}

/**
 * Convert quota bytes into proper human format
 */
function convertReadableQuota(vol_byte) {
	var res = new Object();
	res.val = vol_byte / (1024 *1024);
	res.unit = (res.val > 1000) ? 'GB' : 'MB';
	if (res.unit == 'GB') {
		res.val /= 1024;
	}
	return res;
}


/*****************************************************************************/
/****                 Lang Block JavaScript functions                  ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Links triggers
	 */
	$('#lang_link\\[fr\\]').click(function() {
		lang_block_translate('fr');
	});
	$('#lang_link\\[de\\]').click(function() {
		lang_block_translate('de');
	});
	$('#lang_link\\[en\\]').click(function() {
		lang_block_translate('en');
	});
	$('#lang_link\\[es\\]').click(function() {
		lang_block_translate('es');
	});
	$('#lang_link\\[it\\]').click(function() {
		lang_block_translate('it');
	});
	$('#lang_link\\[nl\\]').click(function() {
		lang_block_translate('nl');
	});
	$('#lang_link\\[pt\\]').click(function() {
		lang_block_translate('pt');
	});
	$('#lang_link\\[pl\\]').click(function() {
		lang_block_translate('pl');
	});
	$('#lang_link\\[zh_CN\\]').click(function() {
		lang_block_translate('zh_CN');
	});
	$('#lang_link\\[zh_TW\\]').click(function() {
		lang_block_translate('zh_TW');
	});	
	$('#lang_link\\[ar_LB\\]').click(function() {
		lang_block_translate('ar');
	});
	$('#lang_link\\[ko\\]').click(function() {
		lang_block_translate('ko');
	});
	$('#lang_link\\[ja\\]').click(function() {
		lang_block_translate('ja');
	});
	$('#lang_link\\[th\\]').click(function() {
		lang_block_translate('th');
	});
	$('#lang_link\\[ru\\]').click(function() {
		lang_block_translate('ru');
	});
	$('#lang_link\\[id\\]').click(function() {
		lang_block_translate('id');
	});
});

/** Configure lang_block depending on settings
 */
function lang_block_configure() {
	
	if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.displayLang != undefined) {
		if ($.settings.lang.displayLang.length == 1) {
			$('#lang_block').hide();
		}
		else {
			$('#lang_block').show();
			for (lang_itt = 0; lang_itt < $.settings.lang.displayLang.length; lang_itt++) {
				if ($.settings.lang.displayLang[lang_itt] == 'ar') {
					$('#lang_link\\[ar_LB\\]').show();
				}
				else {
					$('#lang_link\\[' + $.settings.lang.displayLang[lang_itt] + '\\]').show();
				}
			}
		}
	}
}

/** Executed when links are clicked
 * @param string displayLang - The choosen display language
 */
function lang_block_translate(displayLang) {
	if ($.settings.user == undefined) {
		$.settings.user = new Object();
	}
	$.settings.user.lang = displayLang;
	
	var params = new Object();
	params.language = displayLang;
	
	translate(displayLang);
	// Register the new language on the server
	
	var callbacks = new Object();
	callbacks.success    = function(){};
	
	switchLanguage(callbacks, params);
}


/*****************************************************************************/
/****              Secure Password Form JavaScript functions              ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
// 	$('form[name=securePwdForm] input[name=secure_pwd]').change(function() {
// 		///
// 	});

	/** Buttons triggers
	 */
	$('#securePwdForm_access_button').click(function() {
		//securePwdFormAccess();
	});
	
	/** Form triggers
	 */
	$('form[name="securePwdForm"]').submit(function() {
		securePwdFormAccess(); return false;
	});
});

/** Configure securePwdForm depending on settings
 */
function securePwdForm_configure() {

	// Configure display
	if ($.settings.securePwd == true) {
		// Nothing to do
	}
	else {
		$('form[name="securePwdForm"]').remove();
	}
}

/** Display securePwdForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function securePwdForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($.settings.step == "SECURE_PWD") {
		display = true;
	}
	
	if (display == true) {
		$('form[name="securePwdForm"]').show();
	}
	else {
		$('form[name="securePwdForm"]').hide();
		securePwdForm_empty();
	}
}

/** Empty securePwdForm
 */
function securePwdForm_empty() {

	$('form[name="securePwdForm"] input').each(function() {
		$(this).val('');
	});
}

/** Enable waiting mode on securePwdForm
 */
function securePwdFormWaiting(state) {
	switch (state) {
		case true:
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when button is clicked
 */
function securePwdFormAccess() {

	var params = new Object();
	// Mandatory parameters
	params.securePwd = $('form[name="securePwdForm"] input[name="secure_pwd"]').val();
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { securePwdFormWaiting(true); };
	callbacks.success    = function() { securePwdFormAccessCallback(); };
	callbacks.complete   = function() { securePwdFormWaiting(false); };
	
	securePwd(callbacks, params);
}

/** Executed on return of securePwdFormAccess function
 */
function securePwdFormAccessCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.user == undefined) {
			$.settings.user = new Object();
		}
		if ($.settings.user.securePwd == undefined) {
			$.settings.user.securePwd = new Object();
		}
		$.settings.user.securePwd.value = $('form[name="securePwdForm"] input[name="secure_pwd"]').val();
		displayStep();
	}
}


/*****************************************************************************/
/****           Force Modify Password Form JavaScript functions           ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
// 	$('form[name=forceModifyPwdForm] input[name=old_pwd]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=forceModifyPwdForm] input[name=new_pwd]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=forceModifyPwdForm] input[name=confirm_pwd]').change(function() {
// 		///
// 	});

	/** Buttons triggers
	 */
	$('#forceModifyPwdForm_back_button').click(function() {
		forceModifyPwdFormBack();
	});
	
	$('#forceModifyPwdForm_confirm_button').click(function() {
		forceModifyPwdFormConfirm();
	});
	
	/** Form triggers
	 */
	$('form[name="forceModifyPwdForm"]').submit(function() {
		return false;
	});
	$('#forceModifyPwdForm_help_link').click(function() {
		forceModifyPwdForm_HelpBlock_display();
	});

});

/** Configure forceModifyPwdForm depending on settings
 */
function forceModifyPwdForm_configure() {

	// Configure display
	if ($.settings.forceModifyPwd == true) {
		// Nothing to do
	}
	else {
		$('form[name="forceModifyPwdForm"]').remove();
	}
}

/** Display forceModifyPwdForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function forceModifyPwdForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($.settings.step == "FORCE_MODIFY_PWD") {
		display = true;
	}
	
	if (display == true) {
		$('form[name="forceModifyPwdForm"]').show();
		if ($.settings.user.pwdConstraint != undefined) {
			$('#forceModifyPwdForm_help_tr').show();
		}
	}
	else {
		$("#forceModifyPwdForm_help_block").hide();
		$('form[name="forceModifyPwdForm"]').hide();
		forceModifyPwdForm_empty();
	}
}

/** Empty forceModifyPwdForm
 */
function forceModifyPwdForm_empty() {

	$('form[name="forceModifyPwdForm"] input').each(function() {
		$(this).val('');
	});
}

/** Executed when back button is clicked
 */
function forceModifyPwdFormBack() {
	
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { forceModifyPwdFormBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	
	backAction(callbacks);
}

/** Executed on return of forceModifyPwdFormBack function
 */
function forceModifyPwdFormBackCallback() {

	displayErrorInfo();
	displayStep();
}

/** Enable waiting mode on forceModifyPwdForm
 */
function forceModifyPwdFormWaiting(state) {
	switch (state) {
		case true:
			$('#forceModifyPwdForm_back_button').attr("disabled", true);
			$('#forceModifyPwdForm_confirm_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#forceModifyPwdForm_back_button').attr("disabled", false);
			$('#forceModifyPwdForm_confirm_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when confirm button is clicked
 */
function forceModifyPwdFormConfirm() {

	var params = new Object();
	// Mandatory parameters
	params.login = $.settings.user.login.value;
	params.password = $('form[name="forceModifyPwdForm"] input[name="old_pwd"]').val();
	params.newPassword = $('form[name="forceModifyPwdForm"] input[name="new_pwd"]').val();
	params.newPasswordConfirm = $('form[name="forceModifyPwdForm"] input[name="confirm_pwd"]').val();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { forceModifyPwdFormWaiting(true); };
	callbacks.success    = function() { forceModifyPwdFormConfirmCallback(); };
	callbacks.complete   = function() { forceModifyPwdFormWaiting(false); };
	
	forceModifyPwd(callbacks, params);
}

/** Executed on return of forceModifyPwdFormConfirm function
 */
function forceModifyPwdFormConfirmCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		displayStep();
	}
}

/** Display forceModifyPwdFormHelpBlock_display when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function forceModifyPwdForm_HelpBlock_display(state, displayLang) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#forceModifyPwdForm_help_block').is(':hidden') == true) {
		display = true;
	}
	
	if (display == true) {
		if (translationsAreLoaded == true)
		{
			forceModifyPwdForm_HelpBlock_configure(displayLang);
		}
		$('#forceModifyPwdForm_help_block').show();
	}
	else {
		$('#forceModifyPwdForm_help_block').hide();
	}
}

/** Configure forceModifyPwdForm_help_block
 * @param string displayLang - The language whish to display the content
 */
function forceModifyPwdForm_HelpBlock_configure(displayLang) {
	if ($.settings != undefined && $.settings.user != undefined && $.settings.user.pwdConstraint != undefined)  {
		if ($('#forceModifyPwdForm_help_list').children().length > 1) {
			$('#forceModifyPwdForm_help_list li').not(":first").remove();
		}
		/* Update the content of the help box to display to the user the password
		 * policy in use for his profile */
		//var help_block = $('#forceModifyPwdForm_help_block').clone();
		$("#forceModifyPwdHelpBlock_text").text(getInputTranslation('forceModifyPwdForm_help_text', displayLang));
		var constraintValues = new Array("minLength", "maxLength");
		for (key in constraintValues) {
			var val = constraintValues[key];
			var line = $('#forceModifyPwdForm_help_list li:first').clone();
			line.toggle();
			line.text($.sprintf(getInputTranslation("forceModifyPwdForm_help_" + val, displayLang), $.settings.user.pwdConstraint.value[val]));
			$('#forceModifyPwdForm_help_list').append(line);
		}
		for (key in $.settings.user.pwdConstraint.value.characterSet) {
			var set = $.settings.user.pwdConstraint.value.characterSet[key];
			if (set.quota > 0) {
				var line = $('#forceModifyPwdForm_help_list li:first').clone();
				line.toggle();
				line.text($.sprintf(getInputTranslation("forceModifyPwdForm_help_character_set_text", displayLang), set.quota, set.set.join("")));
				$('#forceModifyPwdForm_help_list').append(line);
			}
		}
	}
}


/*****************************************************************************/
/****                   Logon Form JavaScript functions                   ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Input triggers
	 */
// 	$('form[name=logonForm] input[name=login]').change(function() {
// 		///
// 	});
//
// 	$('form[name=logonForm] input[name=password]').change(function() {
// 		///
// 	});
//
// 	$('form[name=logonForm] input[name=policy_accept]').change(function() {
// 		///
// 	});

	/** Buttons triggers
	 */
	$('#logonForm_standard_authentication_button').click(function(){
		logonForm_toggle_show_authentication_modes(false);
	});

	$('#logonForm_authentication_form_back_button').click(function(){
		logonForm_toggle_show_authentication_modes(true);
	});

	$('#logonForm_shibboleth_authentication_button').click(function(){
		logonFormShibbolethStart();
	});

	$('#logonForm_privatePolicy_back_button').click(function() {
		logonForm_close_privatePolicy_dialog();
	});

	$('#logonForm_privatePolicy_cross_span').click(function() {
		logonForm_close_privatePolicy_dialog();
	});

	/** Link triggers
	 */
	$('#facebookLink').click(function() {
		socialNetworkConnect("facebook");
	});
	$('#googleLink').click(function() {
		socialNetworkConnect("google");
	});
	$('#linkedinLink').click(function() {
		socialNetworkConnect("linkedin");
	});
	$('#twitterLink').click(function() {
		socialNetworkConnect("twitter");
	});

	/** Form triggers
	 */
	$('form[name="logonForm"]').submit(function() {
		logonFormConnect(); return false;
	});
});

/** Configure logonForm depending on settings
 */
function logonForm_configure() {

	// Configure policy display
	if ($.settings.logon != undefined && $.settings.logon.policy != undefined && $.settings.logon.policy.display == true) {
		logonForm_policy_configure();
	}
	else {
		$('#logonForm_policy_block').remove();
	}

	if ($.settings.auth_modes != undefined) {
		// configure shibboleth
		if ($.settings.auth_modes.shibboleth) {
			logonForm_toggle_show_authentication_modes(true);
			if (!$.settings.auth_modes.standard) {
				// do differently for classic and neutral/welcome
				if ($('#logonForm_subscriptionChoice_top_title_block').length
						&& $('#logonForm_subscriptionChoice_block').length) {
					// neutral/welcome case
					$('#logonForm_subscriptionChoice_top_title_block').hide();
					$('#logonForm_subscriptionChoice_block').hide();
					$('#logonForm_standard_authentication_button').parent().hide();
					$('#logonForm_auth_modes_block').show();
				}
				else {
					// classic case
					$('#logonForm_standard_authentication_button').hide();
				}
			}
		}

		// Configure social networks
		if ($.settings.auth_modes.facebook)
		{
			$('#logonForm_socialNetworkChoice_grid').show();
			$('#facebookLink').show();
			if ($.settings.logon != undefined && $.settings.logon.facebook != undefined && $.settings.logon.facebook.need_like) {
				$('table#facebookLike').show();
				if ($.settings.logon.facebook.url_like != undefined && $.settings.logon.facebook.url_like != '') {
					$('span#logonForm_facebook_like_url').text(' ' + $.settings.logon.facebook.url_like);
				}
			}
		}
		if ($.settings.auth_modes.google)
		{
			$('#logonForm_socialNetworkChoice_grid').show();
			$('#googleLink').show();
		}
		if ($.settings.auth_modes.linkedin)
		{
			$('#logonForm_socialNetworkChoice_grid').show();
			$('#linkedinLink').show();
		}
		if ($.settings.auth_modes.twitter)
		{
			$('#logonForm_socialNetworkChoice_grid').show();
			$('#twitterLink').show();
			if ($.settings.logon != undefined && $.settings.logon.twitter != undefined && $.settings.logon.twitter.need_follow) {
				$('table#twitterFollow').show();
				if ($.settings.logon.twitter.name_follow != undefined && $.settings.logon.twitter.name_follow != '') {
					$('span#logonForm_twitter_follow_auto_screen_name').text(' @' + $.settings.logon.twitter.name_follow);
				}
			}
		}
		//OpenID Connect providers
		var authModeOpenidconnectEnabled = false;
		for(key in $.settings.auth_modes)
		{
			if (key.match(/^openidconnect_[\d]*$/))
			{
				$('#logonForm_socialNetworkChoice_openid_grid').append('<div class="openidDiv hoverLink" title="Use your OpenID Connect credentials" onclick="socialNetworkConnect(\'' + key + '\')"><div id="' + key + 'Link" class="openidconnectSmallBox" style="display:none"></div><span class="openidSpan">' + $.settings.auth_modes[key] + '</span></div>');
				$('#logonForm_socialNetworkChoice_openid_grid').show();
				$('#' + key + 'Link').show();

				authModeOpenidconnectEnabled = true;
			}
		}

		// wispr mode
		if ($.settings.auth_modes.wispr) {
			$('#logonForm_wispr_grid').show();
			if ($.settings.wispr && $.settings.wispr.operator_realm) {
				$.each($.settings.wispr.operator_realm, function(operator, realm) {
					$('select#user_wispr_operator').append('<option value="' + operator + '">' + operator + '</option>');
				});
				// link trigger on select list
				$('select#user_wispr_operator').change(function() {
					var current_operator = $(this).val();
					var potential_realm = $.settings.wispr.operator_realm[current_operator];
					var auto_complete_realm = null;
					if ('string' == typeof(potential_realm) && potential_realm.length > 0) {
						// do a little intelligence here to detect different format of realm
						var index_point = potential_realm.indexOf('.');
						// realm contains at least a point, and it is not the last character, then we consider it will be combined by @
						if (0 < index_point && index_point < potential_realm.length - 1) {
							auto_complete_realm = '@' + potential_realm;
						}
						// we will combine the realm by / as default case
						else {
							auto_complete_realm = potential_realm + '/';
						}
					}
					/*
					 * feel free to add customization to force some auto-complete realm here
					 * simple example in one line:
					 *  if (current_operator == 'ipass') { auto_complete_realm = 'IPASS/'; }
					 */
					if (auto_complete_realm) {
						// auto-complete the suggested realm into login
						$('form[name="logonForm"] input[name="login"]').val(auto_complete_realm);
					}
				});
			}
		}

		if ( !$.settings.auth_modes.standard
			&& ($.settings.auth_modes.facebook
				|| $.settings.auth_modes.google
				|| $.settings.auth_modes.linkedin
				|| $.settings.auth_modes.twitter
				|| authModeOpenidconnectEnabled
				|| $.settings.auth_modes.wispr) ) {
			// do differently for classic and neutral/welcome
			if ($('#logonForm_logon_block_credentials').length) {
				// neutral/welcome case
				$('#logonForm_logon_block_credentials').hide();
			}
			else {
				// classic case
				$('#logonForm_login_field').hide();
				$('#logonForm_password_field').hide();
				$('#logonFormConnectionLink').hide();
			}
		}
	}

	// Configure register link
	// do differently for classic and neutral/welcome
	if ($('#logonForm_subscriptionChoice_top_title_block').length
			&& $('#logonForm_subscriptionChoice_block').length) {
		// neutral/welcome case
		if ($.settings.subscribe != undefined && $.settings.subscribe.count > 0) {
			$('#logonForm_subscriptionChoice_top_title_block').show();
			$('#logonForm_subscriptionChoice_block').show();
		}
		else {
			// No subscribe mode
			$('#logonForm_subscriptionChoice_top_title_block').remove();
			$('#logonForm_subscriptionChoice_block').remove();
		}
	}
	else {
		// classic case
		if ($.settings.subscribe != undefined && $.settings.subscribe.count > 1) {
			// Multi subscribe mode
			$('#logonFormSubscriptionLink_link').click(function() {
				logonForm_display(false);
				logonFormSubscribeChoice_display(true);
			});
			$('#logonFormSubscriptionLink_back_button').click(function() {
				logonFormSubscriptionLinkBack();
			});

		}
		else if ($.settings.subscribe != undefined && $.settings.subscribe.count == 1) {
			// Only one subscribe mode
			// Will be configure by the mode config function
		}
		else {
			// No subscribe mode
			$('#logonFormSubscriptionLink_link').remove();
			$('#logonForm_explain_text').remove();
		}
	}
}


/* If more than one authentication mode has been configured, this function
 * displays an additional step where the user can choose his mode.
 * if false is given, this step is hidden
 */
function logonForm_toggle_show_authentication_modes(show){
	$('#logonForm_auth_modes_block').toggle(show);
	// do differently for classic and neutral/welcome
	if ($('#logonForm_logon_block_credentials').length) {
		// neutral/welcome case
		$('#logonForm_logon_block_credentials').toggle(!show);
	}
	else {
		// classic case
		$('#logonForm_login_field').toggle(!show);
		$('#logonForm_password_field').toggle(!show);
		$('#logonFormConnectionLink').toggle(!show);
		$('#logonFormSubscriptionLink_link').toggle(show);
	}
	$('#logonForm_authentication_form_back_button').toggle(!show);
}

/* If a policy acceptance is required by the portal configuration, this function
 * checks that the corresponding checkbox has been clicked.
 */
function logonForm_policy_is_ok() {
	var need_policy = ($.settings.logon != undefined && $.settings.logon.policy != undefined && $.settings.logon.policy.display == true);
	var policy_checked = ($('form[name="logonForm"] input[name="policy_accept"]').is(':checked'));
	return !need_policy || policy_checked;
}

/** Configure logonForm_policy_block
 * @param string lang - The language whish to display the policy
 */
function logonForm_policy_configure(lang) {

	if ($.settings.logon != undefined && $.settings.logon.policy != undefined) {
		var policy = extractPolicyText($.settings.logon, lang);
		$('#logonForm_policy_text').html(policy);
	}
}

/** Configure logonForm_privatePolicy_block
 * @param string displayLang - The language whish to display the policy
 * @param string mode - the mode to configure
 */
function logonForm_privatePolicy_configure(displayLang, mode) {

	var policy = null;
	try {
		policy = eval('$.settings.logon.' + mode + '.policy');
	}
	catch(ex) {
		policy = null;
	}
	if (policy == undefined || policy == null) {
		return;
	}
	var policyWrapper = new Object();
	policyWrapper.policy = policy;
	if(displayLang == undefined || displayLang == null) {
		displayLang = getUserLanguage_default();
	}

	$('#logonForm_privatePolicy_' + mode + '_text').html(extractPolicyText(policyWrapper, displayLang));
}

/** Display logonForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function logonForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step == "LOGON") && ( (typeof informativeWidget_configure != 'function') || ($.settings.informativeWidget == undefined) ) ) {
		display = true;
	}

	if (display == true) {
		$('form[name="logonForm"]').show();

		// Force a feedback disconnection in case of a refresh of a user not known on the central controller.
		// For example, when the connection between the central and the satellite has been down.
		// /!\ Do not move this part outside of this function even if this has already been factorized because there is no redirection or no new feedback portal
		// while we refresh the portal. We just do a display step but we need to disconnect the unknown user from its satellite.
		if ($.settings.user != undefined && $.settings.user.force_feedback_disconnect != undefined && $.settings.user.force_feedback_disconnect) {
			feedbackFormDisconnect();
		}
	}
	else {
		$('form[name="logonForm"]').hide();
		logonForm_empty();
	}
}

/** Empty logonForm
 */
function logonForm_empty() {

	// Emptying only password input
	$('form[name="logonForm"] input[name="password"]').val('');
}

/** Enable waiting mode on logonForm
 */
function logonFormWaiting(state) {
	switch (state) {
		case true:
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when shibboleth button is clicked
 */
function logonFormShibbolethStart(){
	if(!logonForm_policy_is_ok()){
		$.settings.error = {"code" :"error_logon_bad-policy-accept"};
		displayErrorInfo();
		return;
	}
	self.location.href='/shibauth.php';
}


/** Executed when button is clicked
 */
function logonFormConnect() {

	var params = new Object();
	params.login = $('form[name="logonForm"] input[name="login"]').val();
	params.password = $('form[name="logonForm"] input[name="password"]').val();
	params.policyAccept = $('form[name="logonForm"] input[name="policy_accept"]').is(':checked');
	params.wispr_mode = $('form[name="logonForm"] input[name="wispr_mode"]').is(':checked') ? 'true' : 'false';

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	// send cna id if necessary
	var send_cna_id = $.portal_api('isInAutoConnect');
	var cna_id = $.portal_api('getCnaId');
	if (send_cna_id == true && cna_id != null) {
		params.cna_id = cna_id;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { logonFormWaiting(true); };
	callbacks.success    = function() { logonFormConnectCallback(); };
	callbacks.complete   = function() { logonFormWaiting(false); };

	authenticate(callbacks, params);
}

/** Executed on return of logonConnect function
 */
function logonFormConnectCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.user == undefined) {
			$.settings.user = new Object();
		}
		if ($.settings.user.login == undefined) {
			$.settings.user.login = new Object();
			$.settings.user.login.value = $('form[name="logonForm"] input[name="login"]').val();
		}

		displayStep();

		//Reload at the end of the authentication, PMS needs two steps to finalize the authentication!
		if (isAppleCNA && $.settings.step != undefined && $.settings.step == "FEEDBACK") {
			// try to refresh page to get feedback in normal browser (safari) on newer device of apple
			window.location.reload(true);
			// we arrive into this block only when we are in standalone mode, so it isn't necessary to pass information from CNA to real portal
		}
	}
}

/** Display the multi mode choice page depending on state
 * @param boolean state - Indicate if the page must be displayed or not
 */
function logonFormSubscribeChoice_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if (display == true) {
		$('#subscriptionChoice').show();
	}
	else {
		$('#subscriptionChoice').hide();
	}
}

/** Executed when back button is clicked
 */
function logonFormSubscriptionLinkBack() {

	displayStep();
}

/** Social networks
 */
function do_socialNetworkConnect(params) {
	var callbacks = new Object();

	// Add user ip in social network walled garden
	if ( $.settings.user != undefined && $.settings.user.satellite_URL != undefined  && $.settings.user.nas_constructor != null && $.settings.user.nas_constructor == 'ucopia' ) {
		$.ajax({
			type: "POST",
			url: $.settings.user.satellite_URL,
			data: { action: "social_network_walled_garden", type: params.type },
			beforeSend: function() { logonFormWaiting(true); },
			complete: function() { logonFormWaiting(false); },
			success: function () {
				callbacks.success    = function() { socialNetworkConnectCallback(); };
				socialNetworkAuthenticate(callbacks, params);
			},
			error: function () {
				$.settings.error = {"code" :"error_logon_internal"};
				displayErrorInfo();
				return;
			}
		});
	}
	else {
		callbacks.beforeSend = function() { logonFormWaiting(true); };
		callbacks.success    = function() { socialNetworkConnectCallback(); };
		callbacks.complete   = function() { logonFormWaiting(false); };
		socialNetworkAuthenticate(callbacks, params);
	}
}

function socialNetworkConnect(type) {
	var params = new Object();

	params.type = type;
	params.policyAccept = $('form[name="logonForm"] input[name="policy_accept"]').is(':checked');
	if (type == 'twitter') {
		params.userFollow = $('form[name="logonForm"] input[name="twitter_follow"]').is(':checked');
	}

	if (type == 'facebook' ) {
		params.userLike = $('form[name="logonForm"] input[name="facebook_like"]').is(':checked');
	}

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var private_policy = null;
	try {
		private_policy = eval('$.settings.logon.' + type + '.policy');
	}
	catch(ex) {
		private_policy = null;
	}

	// Show a dialog window if private policy need to be accepted
	if ( private_policy != null && private_policy.display == true ) {

		// Hide private policy connection button in case of mandatory private policy
		if ( private_policy.mandatory == true ) {
			$('#logonForm_privatePolicy_connect_button').hide();
			$('#logonForm_privatePolicy_accept').change(function () {
				$('#logonForm_privatePolicy_connect_button').toggle( $('#logonForm_privatePolicy_accept').is(':checked') );
			});
		}

		var modes = ['twitter', 'linkedin', 'google', 'facebook'];
		//FIXEME : Missing openidconnect mode?
		for(var i in modes) {
			if ( type == modes[i] ) {
				$('#logonForm_privatePolicy_' + modes[i] + '_text').show();
			}
			else {
				$('#logonForm_privatePolicy_' + modes[i] + '_text').hide();
			}
		}

		$('#logonForm_privatePolicy_connect_button').click(function() {

			logonForm_close_privatePolicy_dialog();

			params.privatePolicyAccept = $('#logonForm_privatePolicy_accept').is(':checked');

			// Proceed to social network connexion
			do_socialNetworkConnect(params);
		});

		$('#logonForm_privatePolicy_accept').attr('checked', false);
		$("#logonForm_privatePolicy_dialog").show();
	}
	else {
		// No private policy needed. Proceed to social network connexion
		do_socialNetworkConnect(params);
	}
}

/** Executed on return of logonConnect function
 */
function socialNetworkConnectCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.user != undefined && $.settings.user.socialNetwork != undefined && $.settings.user.socialNetwork.redirectURL != undefined) {
			window.location = $.settings.user.socialNetwork.redirectURL;
		}
		displayStep();
	}
}

function logonForm_close_privatePolicy_dialog() {
	$('#logonForm_privatePolicy_connect_button').unbind('click');
	$('#logonForm_privatePolicy_accept').unbind('change');
	$("#logonForm_privatePolicy_dialog").hide();
}

function showWisprConnect(display) {
	if (display == undefined) {
		display = false;
	}
	if (display) {
		$('.logonForm_classic_elements').hide();
		$('.logonForm_wispr_elements').show();
		$('form[name="logonForm"] input[name="wispr_mode"]').attr('checked', true);
	}
	else {
		$('.logonForm_classic_elements').show();
		$('.logonForm_wispr_elements').hide();
		$('form[name="logonForm"] input[name="wispr_mode"]').attr('checked', false);
	}
}


/*****************************************************************************/
/****                 Feedback Form JavaScript functions                  ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
*/
$(document).ready(function() {

	/** Buttons triggers
	*/
	$('#feedbackForm_disconnect_button').click(function() {
		feedbackFormDisconnect();
	});

	/** Form triggers
	*/
	$('form[name="feedbackForm"]').submit(function() {
		return false;
	});
});

/** Configure feedbackForm depending on settings
*/
function feedbackForm_configure() {
	// Configure display
	if ($.settings.feedback != undefined) {

		if ($.settings.feedback.pms != undefined && $.settings.feedback.pms.customer != undefined && $.settings.feedback.pms.customer.display == true) {
			$('#feedbackForm_pms_customer_block').show();
		}
		else {
			$('#feedbackForm_pms_customer_block').remove();
		}

		if ($.settings.feedback.pms != undefined && $.settings.feedback.pms.message != undefined && $.settings.feedback.pms.message.display == true) {
			$('#feedbackForm_pms_message_block').show();
		}
		else {
			$('#feedbackForm_pms_message_block').remove();
		}

		if ($.settings.feedback.caution != undefined && $.settings.feedback.caution.display == true) {
			$('#feedbackForm_caution_block').show();
		}
		else {
			$('#feedbackForm_caution_block').remove();
		}

		if ($.settings.feedback.requestedURL != undefined && $.settings.feedback.requestedURL.display == true) {
			$('#feedbackForm_requested_url_block').show();
		}
		else {
			$('#feedbackForm_requested_url_block').remove();
		}

		if ($.settings.feedback.login != undefined && $.settings.feedback.login.display == true) {
			$('#feedbackForm_login_block').show();
		}
		else {
			$('#feedbackForm_login_block').remove();
		}

		if ($.settings.feedback.profile != undefined && $.settings.feedback.profile.display == true) {
			$('#feedbackForm_profile_block').show();
		}
		else {
			$('#feedbackForm_profile_block').remove();
		}

		if ($.settings.feedback.services != undefined && $.settings.feedback.services.display == true) {
			$('#feedbackForm_services_block').show();
		}
		else {
			$('#feedbackForm_services_block').remove();
		}

		if ($.settings.feedback.ipAddress != undefined && $.settings.feedback.ipAddress.display == true) {
			$('#feedbackForm_ip_address_block').show();
		}
		else {
			$('#feedbackForm_ip_address_block').remove();
		}

		if ($.settings.feedback.incomingNetwork != undefined && $.settings.feedback.incomingNetwork.display == true) {
			$('#feedbackForm_incoming_network_block').show();
		}
		else {
			$('#feedbackForm_incoming_network_block').remove();
		}

		if ($.settings.feedback.incomingZone != undefined && $.settings.feedback.incomingZone.display == true) {
			$('#feedbackForm_incoming_zone_block').show();
		}
		else {
			$('#feedbackForm_incoming_zone_block').remove();
		}

		if ($.settings.feedback.multidevice != undefined && $.settings.feedback.multidevice.display == true) {
			$('feedbackForm_multidevice_block').hide();
		}
		else {
			$('feedbackForm_multidevice_block').remove();
		}

		if ($.settings.feedback.validity != undefined && $.settings.feedback.validity.display == true) {
			$('#feedbackForm_validity_block').show();
		}
		else {
			$('#feedbackForm_validity_block').remove();
		}

		if ($.settings.feedback.totalTimeCredit != undefined && $.settings.feedback.totalTimeCredit.display == true) {
			$('#feedbackForm_total_time_credit_block').show();
		}
		else {
			$('#feedbackForm_total_time_credit_block').remove();
		}

		if ($.settings.feedback.forceDiscTimer != undefined && $.settings.feedback.forceDiscTimer.display == true) {
			$('#feedbackForm_automatic_disconnection_block').show();
		}
		else {
			$('#feedbackForm_automatic_disconnection_block').remove();
		}

		if ($.settings.feedback.totalConsumedTimeCredit != undefined && $.settings.feedback.totalConsumedTimeCredit.display == true) {
			$('#feedbackForm_total_consumed_time_credit_block').show();
		}
		else {
			$('#feedbackForm_total_consumed_time_credit_block').remove();
		}

		if ($.settings.feedback.timeCredit != undefined && $.settings.feedback.timeCredit.display == true) {
			$('#feedbackForm_time_credit_block').show();
		}
		else {
			$('#feedbackForm_time_credit_block').remove();
		}
		if ($.settings.feedback.consumedData != undefined && $.settings.feedback.consumedData.display == true) {
			$('#feedbackForm_quota_total_consumed_data_block').show();
		}
		else {
			$('#feedbackForm_quota_total_consumed_data_block').remove();
		}
	}
}

/** Display feedbackForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function feedbackForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($.settings.step == "FEEDBACK") {
		display = true;
	}

	if (display == true) {

		var userLang = navigator.language || navigator.userLanguage;

		var lang;

		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
			lang = $.settings.user.lang;
		}
		else if (userLang != ""){
			lang = userLang.substring(0, 2);
		}
		else {
			lang = "en";
		}

		if (isAppleCNA) {
			// Trigger a on-click event on the lang link to get out of CNA in OOB architecture
			var a = $('#lang_link\\['+lang+'\\]').get(0);
			var e = document.createEvent('MouseEvents');
			isAppleCNA_fakeclick = true;
			e.initEvent( 'click', true, true );
			a.dispatchEvent(e);
		}
		else {
			// a fake click will also call switch language function, we should not do it twice
			lang_block_translate(lang);
		}
		feedbackForm_fillIn();
		feedbackFormRefresh();
		$('form[name="feedbackForm"]').show();
	}
	else {
		$('form[name="feedbackForm"]').hide();
	}
}

/** Fill feedbackForm depending on settings
*/
function feedbackForm_fillIn(displayLang) {
	if ($.settings.user != undefined) {
		var userSettings = $.settings.user;

		if (userSettings.PMS != undefined && userSettings.PMS.customer != undefined) {
			$('#feedbackForm_pms_customer_value').text(userSettings.PMS.customer.value);
		}
		else {
			$('#feedbackForm_pms_customer_value').text('');
		}

		if (userSettings.PMS != undefined && userSettings.PMS.message != undefined) {
			$('#feedbackForm_pms_message_value').text(userSettings.PMS.message.value);
		}
		else {
			$('#feedbackForm_pms_message_value').text('');
		}

		if (userSettings.autoDisconnect != undefined && userSettings.autoDisconnect.value == false) {
			$('#feedbackForm_caution_block').show();

			// Display different message in case of standalone or OOB
			if ( userSettings.satellite_URL == undefined ) {
				$('#feedbackForm_caution_text').show();
				$('#feedbackForm_caution_oob_text').hide();
				$('#feedbackForm_caution_block').removeClass('warning');
				$('#feedbackForm_caution_block').addClass('caution');
			}
			else {
				$('#feedbackForm_caution_text').hide();
				$('#feedbackForm_caution_oob_text').show();
				$('#feedbackForm_caution_block').removeClass('caution');
				$('#feedbackForm_caution_block').addClass('warning');
			}
		}
		else {
			$('#feedbackForm_caution_block').hide();
		}

		if ($.settings.postConnectRedirect != undefined && $.settings.postConnectRedirect.url != undefined)
		{
			$('#feedbackForm_requested_url_link').attr("href", $.settings.postConnectRedirect.url);
			$('#feedbackForm_requested_url_block').show();

			if (userSettings.autoDisconnect != undefined && userSettings.autoDisconnect.value == true && $.settings.postConnectRedirect.delay != undefined) {
				$('#feedbackForm_postConnectRedirectDelay_block').show();
			}
		}
		else {
			$('#feedbackForm_postConnectRedirectDelay_block').hide();

			if (userSettings.requestedURL != undefined) {
				$('#feedbackForm_requested_url_link').attr("href", userSettings.requestedURL.value);
				$('#feedbackForm_requested_url_block').show();
			}
			else {
				$('#feedbackForm_requested_url_link').attr("href", "#");
				$('#feedbackForm_requested_url_block').hide();
			}
		}

		if (userSettings.login != undefined && userSettings.login.value != undefined) {
			$('#feedbackForm_login_value').text(userSettings.login.value);
		}
		else {
			$('#feedbackForm_login_value').text('');
		}

		if (userSettings.profile != undefined && userSettings.profile.value != undefined) {
			$('#feedbackForm_profile_value').text(userSettings.profile.value);
		}
		else {
			$('#feedbackForm_profile_value').text('');
		}

		feedbackForm_package_display(displayLang);
		if (userSettings.package != undefined) {
			$('#feedbackForm_package_block').show();
		}
		else {
			$('#feedbackForm_package_block').hide();
		}

		if (userSettings.services != undefined && userSettings.services.value != undefined) {
			$('#feedbackForm_services_value').text(userSettings.services.value);
		}
		else {
			$('#feedbackForm_services_value').text('');
		}

		if (userSettings.ipAddress != undefined && userSettings.ipAddress.value != undefined) {
			$('#feedbackForm_ip_address_value').text(userSettings.ipAddress.value);
		}
		else {
			$('#feedbackForm_ip_address_value').text('');
		}

		if (userSettings.incomingNetwork != undefined && userSettings.incomingNetwork.value != undefined) {
			$('#feedbackForm_incoming_network_value').text(userSettings.incomingNetwork.value);
		}
		else {
			$('#feedbackForm_incoming_network_value').text('');
		}

		if (userSettings.incomingZone != undefined && userSettings.incomingZone.value != undefined) {
			$('#feedbackForm_incoming_zone_value').text(userSettings.incomingZone.value);
		}
		else {
			$('#feedbackForm_incoming_zone_value').text('');
		}

		feedbackForm_multidevice_fillIn();

		if (userSettings.schedule != undefined && userSettings.schedule.value != undefined) {
			feedbackForm_schedule_display(displayLang);
		}
		else {
			$('#feedbackForm_schedule_value').text('');
		}

		if (userSettings.validity != undefined && userSettings.validity.value != 0) {
			var timezoneLocalOffset = new Date();
			var validity = new Date(parseInt(userSettings.validity.value) * 1000); // Must give date in milliseconds
			validity = explodeDate(validity);
			var text = $.sprintf(getGenericTranslation('full-date-display', displayLang), validity.year, validity.monthNumber, getGenericTranslation(validity.month, displayLang), validity.dayNumber, getGenericTranslation(validity.day, displayLang), validity.hours[24], validity.minutes, validity.hours[12], validity.hours['ext']);
			$('#feedbackForm_validity_value').text($.sprintf(getGenericTranslation('feedbackForm_validity_valid-until', displayLang), text));
		}
		else {
			$('#feedbackForm_validity_value').text(getGenericTranslation('feedbackForm_validity_always-valid', displayLang));
		}

		if (userSettings.timeCredit != undefined) {
			var hours = Math.floor(userSettings.timeCredit.value / 3600);
			var mins = (userSettings.timeCredit.value - (hours * 3600)) / 60;
			var hours_label = getGenericTranslation('hour', displayLang, (hours > 1));
			var mins_label = getGenericTranslation('minute', displayLang, (mins > 1));
			var reneweach = 0;
			if (userSettings.timeCredit.reneweach != undefined) {
				reneweach = userSettings.timeCredit.reneweach.value;
				text = getGenericTranslation('feedbackForm_time-credit-renew-each', displayLang, (userSettings.timeCredit.reneweach.value > 1));
			}
			else {
				text = getGenericTranslation('feedbackForm_time-credit', displayLang);
			}
			text = $.sprintf(text, hours, hours_label, mins, mins_label, reneweach);
			$('#feedbackForm_time_credit_value').text(text);
			$('#feedbackForm_time_credit_block').show();
		}
		else {
			$('#feedbackForm_time_credit_value').text('');
			$('#feedbackForm_time_credit_block').hide()
		}

		if (userSettings.timeCredit != undefined && userSettings.timeCredit.remaining != undefined) {
			feedbackForm_remainingTimeCredit_timer_start(displayLang);
			$('#feedbackForm_remaining_time_credit_block').show();
		}
		else {
			$('#feedbackForm_remaining_time_credit_value').text('');
			$('#feedbackForm_remaining_time_credit_block').hide();
		}

		if (userSettings.forceDiscTimer != undefined && userSettings.forceDiscTimer.value != undefined) {
			feedbackForm_forceDiscTimer_start(displayLang);
			$('#feedbackForm_automatic_disconnection_block').show();
		}
		else {
			$('#feedbackForm_automatic_disconnection_value').text('');
			$('#feedbackForm_automatic_disconnection_block').hide();
		}

		if (userSettings.consumedData != undefined && userSettings.consumedData.download.value != undefined) {
			// check whether we have disconnect quota or not
			var text_date, text_used, text_max, vol_max_up, vol_max_down;
			var disconnect_quota = false, sum_quota = false;
			if (userSettings.consumedData.extra != undefined && userSettings.consumedData.extra.value != undefined) {
				$.each(userSettings.consumedData.extra.value, function(key, val) {
					if (val.isDisconnectQuota == true) {
						disconnect_quota = true;
						sum_quota = val.isSumQuota;
						vol_max_up = val.total.upload;
						vol_max_down = val.total.download;
						return false;
					}
				});
			}

			var timezoneLocalOffset = new Date();
			// we show timestamp with timezone of zone here if we have defined one (also with its name)
			if (userSettings.consumedData.renewTimestamp != undefined && userSettings.consumedData.renewTimestamp.value > 0) {

				text_date = getGenericTranslation('feedbackForm_quota_consumedData_with_renew', displayLang);
				var obj_date = new Date((parseInt(userSettings.consumedData.renewTimestamp.value) + parseInt(userSettings.timezoneOffset.value) + parseInt(timezoneLocalOffset.getTimezoneOffset()*60)) * 1000); // Must give date in milliseconds
			}
			else {
				text_date = getGenericTranslation('feedbackForm_quota_consumedData_with_sincnewe', displayLang);
				var obj_date = new Date((parseInt(userSettings.consumedData.timestamp.value) + parseInt(userSettings.timezoneOffset.value) + parseInt(timezoneLocalOffset.getTimezoneOffset()*60)) * 1000); // Must give date in milliseconds
				/* // to show timestamp with user local timezone, please use the following block
				var timezoneLocalOffset = new Date();
				var obj_date = new Date((parseInt(userSettings.consumedData.timestamp.value) + parseInt(userSettings.timezoneOffset.value) + parseInt(timezoneLocalOffset.getTimezoneOffset()*60)) * 1000); // Must give date in milliseconds
				 */
			}
			obj_date = explodeDate(obj_date);
			var date = $.sprintf(getGenericTranslation('full-date-display', displayLang), obj_date.year, obj_date.monthNumber, getGenericTranslation(obj_date.month, displayLang), obj_date.dayNumber, getGenericTranslation(obj_date.day, displayLang), obj_date.hours[24], obj_date.minutes, obj_date.hours[12], obj_date.hours['ext']);
			// to show only the date, please use the following line
//			var date = $.sprintf(getGenericTranslation('calendar-date-display', displayLang), obj_date.year, obj_date.monthNumber, getGenericTranslation(obj_date.month, displayLang), obj_date.dayNumber);
			text_date = $.sprintf(text_date, date);
			// add timezone identifier if we have no timezone in current zone by default
			if (userSettings.consumedData.timezone != undefined && userSettings.consumedData.timezone.value != undefined
					&& userSettings.consumedData.timezone.value.isControllerTimezone === false) {
				text_date += ' (' + userSettings.consumedData.timezone.value.zoneTimezone + ')';
			}
			// max data
			if (disconnect_quota) {
				var data_up = convertReadableQuota(vol_max_up);
				if (sum_quota) {
					if (data_up.val > -1) {
						var data_sum = convertReadableQuota(userSettings.consumedData.upload.value + userSettings.consumedData.download.value);
						text_used = $.sprintf(getGenericTranslation('feedbackForm_quota_consumedData_sum_with_max_sum', displayLang), data_sum.val, data_sum.unit, data_up.val, data_up.unit);
					}
				}
				else {
					var data_down = convertReadableQuota(vol_max_down);
					var data_consumed_up = convertReadableQuota(userSettings.consumedData.upload.value);
					var data_consumed_down = convertReadableQuota(userSettings.consumedData.download.value);

					text_used = "";
					if (data_up.val > -1) {
						// Empty value for down threthhold don't show on feedback
						text_used += $.sprintf(getGenericTranslation('feedbackForm_quota_up_consumedData_with_max_individual', displayLang), data_consumed_up.val, data_consumed_up.unit, data_up.val, data_up.unit);
						text_used += (data_down.val > -1 ? "\n" : '');
					}
					if (data_down.val > -1) {
						// Empty value for up threethhold. Don't show on feedback
						text_used += $.sprintf(getGenericTranslation('feedbackForm_quota_down_consumedData_with_max_individual', displayLang), data_consumed_down.val, data_consumed_down.unit, data_down.val, data_down.unit);
					}
				}
			}
			else {
				text_used = "";
			}

			if (!text_used || text_used == "") {
				// used data
				if (sum_quota) {
					var data_sum = convertReadableQuota(userSettings.consumedData.upload.value + userSettings.consumedData.download.value);
					text_used = $.sprintf(getGenericTranslation('feedbackForm_quota_consumedData_sum', displayLang), data_sum.val, data_sum.unit);
				}
				else {
					var data_up = convertReadableQuota(userSettings.consumedData.upload.value);
					var data_down = convertReadableQuota(userSettings.consumedData.download.value);
					text_used = $.sprintf(getGenericTranslation('feedbackForm_quota_consumedData_individial', displayLang), data_down.val, data_down.unit, data_up.val, data_up.unit);
				}
			}

			// concat text
			text = text_used + (text_date ? ("\n" + text_date) : '');

			$('#feedbackForm_quota_total_consumed_data_value').text(text).css('white-space', 'pre-wrap');
			$('#feedbackForm_quota_total_consumed_data_block').show();
		}
		else {
			$('#feedbackForm_quota_total_consumed_data_value').text('');
			$('#feedbackForm_quota_total_consumed_data_block').hide();
		}

		// Apply CSS style to bypass IE browsers problem
		// Correct CSS pseudo class :first-child IE error on dynamic content
		if ($.browser.msie) {
			$('#reserved_block form[name="feedbackForm"] td[colspan!="2"]:first-child').each(function() {
				$(this).attr('style', "text-align: right");
			});
		}

		if (userSettings.autoDisconnect != undefined && userSettings.autoDisconnect.value == true && $.settings.postConnectRedirect != undefined && $.settings.postConnectRedirect.url != undefined && $.settings.postConnectRedirect.delay != undefined)
		{
			if ($.settings.postConnectRedirect.delay > 0)
			{
				feedbackForm_postConnectRedirectDelay_timer_start(displayLang);
			}
			else {
				feedbackForm_postConnectRedirectDelay_redirect();
			}
		}

		if (userSettings.disconnectButton != undefined && userSettings.disconnectButton.value == false) {
			$('#feedbackForm_disconnect_button').hide();
		}
		else {
			$('#feedbackForm_disconnect_button').show();
		}
	}
}

function feedbackFormRefresh() {
	// We must refresh the user connection
	if ($.settings.user != undefined) {
		refreshObj.login = $.settings.user.login.value;
		refreshObj.refreshInterval = ($.settings.refreshInterval == undefined) ? 50000 : $.settings.refreshInterval;

		if ($.settings.user.securePwd != undefined) {
			refreshObj.securePwd = $.settings.user.securePwd.value;
		}
		startRefresh();
		if ($.settings.user.isConnected == true) {
			doRefresh();
		}
	}
}

/** Enable waiting mode on feedbackForm
*/
function feedbackFormWaiting(state) {
	switch (state) {
		case true:
			$('#feedbackForm_disconnect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#feedbackForm_disconnect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when button is clicked
*/
function feedbackFormDisconnect() {

	var params = new Object();
	if ($.settings.user != undefined) {
		if ($.settings.user.login != undefined) {
			params.login = $.settings.user.login.value;
		}
		if ($.settings.user.securePwd != undefined) {
			params.securePwd = $.settings.user.securePwd.value;
		}
	}

	// Stopping refresh
	stopRefresh();
	feedbackForm_forceDiscTimer_stop();// Stop Force Diconnect timer in case it is runing and user clicks on disconnect button
	feedbackForm_remainingTimeCredit_timer_stop();

	var callbacks = new Object();
	callbacks.beforeSend = function() { feedbackFormWaiting(true); };
	callbacks.success    = function() { feedbackFormDisconnectCallback(); };
	callbacks.complete   = function() { feedbackFormWaiting(false); };

	disconnect(callbacks, params);
}

/** Executed on return of feedbackFormDisconnect function
*/
function feedbackFormDisconnectCallback() {
	if ($.settings.user.logout_URL_params != undefined && $.settings.user.isConnected != undefined && $.settings.user.isConnected == true) {

		return buildRedirectionURL($.settings.user.logout_URL_params);

	}

	displayErrorInfo();
	displayStep();
	clearUserSettings();
}

function feedbackForm_package_display(displayLang) {
	if ($.settings.subscribe != undefined && $.settings.subscribe.pms != undefined && $.settings.subscribe.pms.package != undefined) {
		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		var describe;
		var describeLanguage;
		if ($.settings.user != undefined && $.settings.user.package != undefined) {
			if ($.settings.user.package[0][displayLang] != undefined) {
				describe = $.settings.user.package[0][displayLang].text;
				describeLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && $.settings.user.package[0][$.settings.lang.defaultLang] != undefined) {
				describe = $.settings.user.package[0][$.settings.lang.defaultLang].text;
				describeLanguage = $.settings.lang.defaultLang;
			}
			else {
				describe = $.settings.user.package[0]["en"].text; // We take an arbitrary language
				describeLanguage = "en";
			}
			if ($.settings.user.package[0]['currency'] == "free") {
				describe += "&nbsp;" + "(" + getGenericTranslation('free_package', describeLanguage) + ")";
			}
			else {
				describe += "&nbsp;" + "(" + $.settings.user.package[0]['price'] + "&nbsp;" + $.settings.user.package[0]['currency'] + ")";
			}

			$('#feedbackForm_package_value').html(describe);
		}
		else {
			$('#feedbackForm_package_value').text('');
		}
	}
	else {
		$('#feedbackForm_package_value').text('');
	}
}

function feedbackForm_schedule_display(displayLang) {
	if ($.settings.user != undefined && $.settings.user.schedule != undefined) {
		var text = '<ul style="margin: 0px; padding: 0px; list-style-position: inside; list-style-type: circle">';
		for (entry_itt = 0; entry_itt < $.settings.user.schedule.value.length; entry_itt++) {
			var entry_value_itt = $.settings.user.schedule.value[entry_itt];
			var begin_date = new Date();
			begin_date.setHours(entry_value_itt['begin']['hour']);
			begin_date.setMinutes(entry_value_itt['begin']['min']);
			begin_date = explodeDate(begin_date);

			var end_date = new Date();
			end_date.setHours(entry_value_itt['end']['hour']);
			end_date.setMinutes(entry_value_itt['end']['min']);
			end_date = explodeDate(end_date);
			if (entry_value_itt['end']['hour'] == 24) {
				end_date.hours[24] = 23;
				end_date.hours[12] = 11;
				end_date.minutes = 59;
				end_date.hours['ext'] = "pm";
			}

			if ($.settings.user.schedule.value.length > 1) {
				text += '<li>';
			}
			if (entry_value_itt['begin']['day'] == entry_value_itt['end']['day']) { // Schedule on one day
				if (begin_date.hours[24] == 0 && end_date.hours[24] == 23 && begin_date.minutes == 0 && end_date.minutes == 59) {
					text += $.sprintf(getGenericTranslation('feedbackForm_schedule_all-day', displayLang), getGenericTranslation(entry_value_itt['begin']['day'], displayLang));
				}
				else {
					text += $.sprintf(getGenericTranslation('feedbackForm_schedule_1-day', displayLang), getGenericTranslation(entry_value_itt['begin']['day'], displayLang), $.sprintf(getGenericTranslation('short-time-display-without-seconds', displayLang), begin_date.hours[24], begin_date.minutes, begin_date.hours[12], begin_date.hours['ext']), $.sprintf(getGenericTranslation('short-time-display-without-seconds', displayLang), end_date.hours[24], end_date.minutes, end_date.hours[12], end_date.hours['ext']));
				}
			}
			else { // Schedule over days
				if ( (entry_value_itt['begin']['day'] == "monday") && (entry_value_itt['end']['day'] == "sunday") ) { // All week
					if (begin_date.hours[24] == 0 && end_date.hours[24] == 23 && begin_date.minutes == 0 && end_date.minutes == 59) {
						text += getGenericTranslation('feedbackForm_schedule_all-week', displayLang);
						break;
					}
				}
				text += $.sprintf(getGenericTranslation('feedbackForm_schedule_2-days', displayLang), getGenericTranslation(entry_value_itt['begin']['day'], displayLang), $.sprintf(getGenericTranslation('short-time-display-without-seconds', displayLang), begin_date.hours[24], begin_date.minutes, begin_date.hours[12], begin_date.hours['ext']), getGenericTranslation(entry_value_itt['end']['day'], displayLang), $.sprintf(getGenericTranslation('short-time-display-without-seconds', displayLang), end_date.hours[24], end_date.minutes, end_date.hours[12], end_date.hours['ext']));
			}
			if ($.settings.user.schedule.value.length > 1) {
				text += '</li>';
			}
		}
		text += '</ul>';
		$('#feedbackForm_schedule_value').html(text);
	}
	else {
		$('#feedbackForm_schedule_value').html('');
	}
}

function feedbackForm_remainingTimeCredit_timer_start(displayLang) {
	if (timerObj.remainingTimeCredit == undefined) {
		timerObj.remainingTimeCredit = new Array();
		timerObj.remainingTimeCredit.refreshInterval = 1000;
		timerObj.remainingTimeCredit.ressource =  window.setInterval(function(){feedbackForm_remainingTimeCredit_timer_display(displayLang);}, timerObj.remainingTimeCredit.refreshInterval);
	}
}
function feedbackForm_remainingTimeCredit_timer_stop() {
	if (timerObj.remainingTimeCredit != undefined) {
		window.clearInterval(timerObj.remainingTimeCredit.ressource);
		delete timerObj.remainingTimeCredit;
	}
}

function feedbackForm_remainingTimeCredit_timer_display(displayLang) {

	if (timerObj.remainingTimeCredit != undefined && $.settings != undefined && $.settings.user != undefined && $.settings.user.timeCredit != undefined && $.settings.user.timeCredit.remaining != undefined) {
		$.settings.user.timeCredit.remaining.value--;
		if ($.settings.user.timeCredit.remaining.value > 0) {
			var hours = Math.floor($.settings.user.timeCredit.remaining.value / 3600);
			var mins = Math.floor(($.settings.user.timeCredit.remaining.value - (hours * 3600)) / 60);
			var seconds = $.settings.user.timeCredit.remaining.value - (hours * 3600) - (mins * 60);

			var hours_label = getGenericTranslation('hour', displayLang, (hours > 1));
			var mins_label = getGenericTranslation('minute', displayLang, (mins > 1));
			var seconds_label = getGenericTranslation('second', displayLang, (seconds > 1));

			$('#feedbackForm_remaining_time_credit_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-with-seconds'), hours, hours_label, mins, mins_label, seconds, seconds_label));
		}
		else {
			feedbackForm_remainingTimeCredit_timer_stop();
			$('#feedbackForm_remaining_time_credit_value').text('-');
			// No remaining time credit, disconnect user
			//feedbackFormDisconnect();
		}
	}
}

function feedbackForm_forceDiscTimer_start(displayLang) {
	if ($('#feedbackForm_automatic_disconnection_block').is(':hidden')) {
		if($.settings.user.forceDiscTimer != undefined && $.settings.user.forceDiscTimer.value != undefined) {
			if (timerObj.forceDiscTimer == undefined) {
				timerObj.forceDiscTimer = new Array();
				timerObj.forceDiscTimer.refreshInterval = 1000;
				timerObj.forceDiscTimer.value = $.settings.user.forceDiscTimer.value;
				timerObj.forceDiscTimer.resource = window.setInterval(function() { feedbackForm_forceDiscTimer_display(displayLang);}, timerObj.forceDiscTimer.refreshInterval);
			}
		}
	}
}

function feedbackForm_forceDiscTimer_stop() {
	$('#feedbackForm_automatic_disconnection_value').text('-');
	if (timerObj.forceDiscTimer != undefined && timerObj.forceDiscTimer.resource != undefined) {
		window.clearInterval(timerObj.forceDiscTimer.resource);
		delete timerObj.forceDiscTimer;
	}
}

function feedbackForm_forceDiscTimer_display(displayLang) {
	if (timerObj.forceDiscTimer != undefined && timerObj.forceDiscTimer.value != undefined) {
		timerObj.forceDiscTimer.value--;
		if (timerObj.forceDiscTimer.value > 0) {
			var hours = Math.floor(timerObj.forceDiscTimer.value / 3600);
			var mins = Math.floor((timerObj.forceDiscTimer.value - (hours * 3600)) / 60);
			var seconds = timerObj.forceDiscTimer.value - (hours * 3600) - (mins * 60);

			var hours_label = getGenericTranslation('hour', displayLang, (hours > 1));
			var mins_label = getGenericTranslation('minute', displayLang, (mins > 1));
			var seconds_label = getGenericTranslation('second', displayLang, (seconds > 1));

			$('#feedbackForm_automatic_disconnection_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-with-seconds'), hours, hours_label, mins, mins_label, seconds, seconds_label));
		}
		else {
			feedbackForm_forceDiscTimer_stop();
			feedbackFormDisconnect();
		}
	}
}


function feedbackForm_multidevice_fillIn() {

	if ($.settings.user.multidevice != undefined && $.settings.user.multidevice.value != undefined) {
		$('#feedbackForm_multidevice_value').text($.settings.user.multidevice.value);
		$('#feedbackForm_multidevice_block').show();
	}
	else {
		$('#feedbackForm_multidevice_block').hide();
		$('#feedbackForm_multidevice_value').text('');
	}
}

// Redirect URL + delay
function feedbackForm_postConnectRedirectDelay_timer_start(displayLang) {
	if (timerObj.postConnectRedirectDelay == undefined) {
		timerObj.postConnectRedirectDelay = new Array();
		timerObj.postConnectRedirectDelay.refreshInterval = 1000;
		timerObj.postConnectRedirectDelay.remaining = $.settings.postConnectRedirect.delay;
		timerObj.postConnectRedirectDelay.ressource =
			window.setInterval(function(){feedbackForm_postConnectRedirectDelay_timer_display(displayLang);}, timerObj.postConnectRedirectDelay.refreshInterval);
	}
}
function feedbackForm_postConnectRedirectDelay_timer_stop() {
	if (timerObj.postConnectRedirectDelay != undefined) {
		window.clearInterval(timerObj.postConnectRedirectDelay.ressource);
		delete timerObj.postConnectRedirectDelay;
	}
}

function feedbackForm_postConnectRedirectDelay_timer_display(displayLang) {

	if (timerObj.postConnectRedirectDelay.remaining) {
		timerObj.postConnectRedirectDelay.remaining--;
		if (timerObj.postConnectRedirectDelay.remaining > 0) {
			var seconds_label = getGenericTranslation('second', displayLang, (timerObj.postConnectRedirectDelay.remaining > 1));
			$('#feedbackForm_postConnectRedirectDelay_text').text($.sprintf(getTextTranslation('feedbackForm_postConnectRedirectDelay_value'), timerObj.postConnectRedirectDelay.remaining, seconds_label));
		}
		else {
			feedbackForm_postConnectRedirectDelay_timer_stop();
			$('#feedbackForm_postConnectRedirectDelay_block').hide();
			feedbackForm_postConnectRedirectDelay_redirect();
		}
	}
}

function feedbackForm_postConnectRedirectDelay_redirect()
{
	window.location = $.settings.postConnectRedirect.url;
}


/*****************************************************************************/
/****              Modify Password Form JavaScript functions              ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Input triggers
	 */
// 	$('form[name=modifyPwdForm] input[name=old_pwd]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=modifyPwdForm] input[name=new_pwd]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=modifyPwdForm] input[name=confirm_pwd]').change(function() {
// 		///
// 	});

	/** Buttons triggers
	 */
	$('#modifyPwdForm_back_button').click(function() {
		modifyPwdLink_display();
	});
	
	$('#modifyPwdForm_confirm_button').click(function() {
		modifyPwdFormConfirm();
	});
	
	/** Form triggers
	 */
	$('form[name="modifyPwdForm"]').submit(function() {
		return false;
	});
	
	/** Link triggers
	 */
	$('#modifyPwdLink_link').click(function() {
		modifyPwdLink_display();
	});

	$('#modifyPwdForm_help_link').click(function() {
		modifyPwdForm_HelpBlock_display();
	});
});

/** Configure modifyPwdForm depending on settings
 */
function modifyPwdForm_configure() {
	// Moving link to right location
	$('#modifyPwdLink').appendTo('#feedbackForm_settings_link td').show();
}

/** Display modifyPwdForm depending on settings
 * @param boolean state - Indicate if the form must be displayed or not
 */
function modifyPwdForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if (display == true) {
		$('form[name="modifyPwdForm"]').show();
		if ($.settings.user.pwdConstraint != undefined) {
			$('#modifyPwdForm_help_tr').show();
		}
	}
	else {
		$("#modifyPwdForm_help_block").hide();
		$('form[name="modifyPwdForm"]').hide();
		modifyPwdForm_empty();

		if ($.settings.user && $.settings.user.allowModPwdBySelf == true) {
			$('#modifyPwdLink_link').show();
		}
		else {
			$('#modifyPwdLink_link').hide();
		}
	}
}

/** Empty modifyPwdForm
 */
function modifyPwdForm_empty() {

	$('form[name="modifyPwdForm"] input').each(function() {
		$(this).val('');
	});
}

/** Enable waiting mode on modifyPwdForm
 */
function modifyPwdFormWaiting(state) {
	switch (state) {
		case true:
			$('#modifyPwdForm_back_button').attr("disabled", true);
			$('#modifyPwdForm_confirm_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#modifyPwdForm_back_button').attr("disabled", false);
			$('#modifyPwdForm_confirm_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when button is clicked
 */
function modifyPwdFormConfirm() {

	var params = new Object();
	// Mandatory parameters
	params.login = $.settings.user.login.value;
	params.password = $('form[name="modifyPwdForm"] input[name="old_pwd"]').val();
	params.newPassword = $('form[name="modifyPwdForm"] input[name="new_pwd"]').val();
	params.newPasswordConfirm = $('form[name="modifyPwdForm"] input[name="confirm_pwd"]').val();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { modifyPwdFormWaiting(true); };
	callbacks.success    = function() { modifyPwdFormConfirmCallback(); };
	callbacks.complete   = function() { modifyPwdFormWaiting(false); };
	
	modifyPwd(callbacks, params);
}

/** Executed on return of modifyPwdFormConfirm function
 */
function modifyPwdFormConfirmCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		modifyPwdLink_display(false);
		feedbackForm_display(true);
	}
}

/*****************************************************************************/

/** Display modifyPwdLink_block depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function modifyPwdLink_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.user == undefined) || ($.settings.user.modifyPwdForm == undefined) || ($.settings.user.modifyPwdForm.display != true) ) {
		display = true;
	}
	else {
		display = false;
	}
	
	if ($.settings.user == undefined) {
		$.settings.user = new Object();
	}
	if ($.settings.user.modifyPwdForm == undefined) {
		$.settings.user.modifyPwdForm = new Object();
	}
	$.settings.user.modifyPwdForm.display = display;
	modifyPwdForm_display(display);
	// We display the opposite the feedback
	feedbackForm_display(!display);
}

/** Display modifyPwdFormHelpBlock_display when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function modifyPwdForm_HelpBlock_display(state, displayLang) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#modifyPwdForm_help_block').is(':hidden') == true) {
		display = true;
	}
	
	if (display == true) {
		if (translationsAreLoaded == true)
		{
			modifyPwdForm_HelpBlock_configure(displayLang);
		}
		$('#modifyPwdForm_help_block').show();
	}
	else {
		$('#modifyPwdForm_help_block').hide();
	}
}

/** Configure modifyPwdForm_help_block
 * @param string displayLang - The language whish to display the content
 */
function modifyPwdForm_HelpBlock_configure(displayLang) {
	if ($.settings != undefined && $.settings.user != undefined && $.settings.user.pwdConstraint != undefined)  {
		if ($('#modifyPwdForm_help_list').children().length > 1) {
			$('#modifyPwdForm_help_list li').not(":first").remove();
		}
		/* Update the content of the help box to display to the user the password
		 * policy in use for his profile */
		//var help_block = $('#modifyPwdForm_help_block').clone();
		$("#modifyPwdHelpBlock_text").text(getInputTranslation('modifyPwdForm_help_text', displayLang));
		var constraintValues = new Array("minLength", "maxLength");
		for (key in constraintValues) {
			var val = constraintValues[key];
			var line = $('#modifyPwdForm_help_list li:first').clone();
			line.toggle();
			line.text($.sprintf(getInputTranslation("modifyPwdForm_help_" + val, displayLang), $.settings.user.pwdConstraint.value[val]));
			$('#modifyPwdForm_help_list').append(line);
		}
		for (key in $.settings.user.pwdConstraint.value.characterSet) {
			var set = $.settings.user.pwdConstraint.value.characterSet[key];
			if (set.quota > 0) {
				var line = $('#modifyPwdForm_help_list li:first').clone();
				line.toggle();
				line.text($.sprintf(getInputTranslation("modifyPwdForm_help_character_set_text", displayLang), set.quota, set.set.join("")));
				$('#modifyPwdForm_help_list').append(line);
			}
		}
	}
}


/*****************************************************************************/
/****          Get Purchase Summary Form JavaScript functions           ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
	$('#getPurchaseSummaryForm_back_button').click(function() {
		getPurchaseSummaryLink_display(false);
	});
	
	$('#getPurchaseSummaryForm_download_button').click(function() {
		getPurchaseSummaryFormConfirm();
	});
	
	/** Form triggers
	 */
	$('form[name="getPurchaseSummaryForm"]').submit(function() {
		return false;
	});
	
	/** Link triggers
	 */
	$('#getPurchaseSummaryLink_link').click(function() {
		getPurchaseSummaryFormGenerate();
	});
});

/** Configure getPurchaseSummaryForm depending on settings
 */
function getPurchaseSummaryForm_configure() {
	// Configure display
	if ($.settings.getPurchaseSummary == true) {
		// Moving link to right location
		$('#getPurchaseSummaryLink').appendTo('#feedbackForm_settings_link td').show();
	}
	else {
		$('form[name="getPurchaseSummaryForm"]').remove();
		$('#getPurchaseSummaryLink').remove();
	}
}

/** Display getPurchaseSummaryForm depending on settings
 * @param boolean state - Indicate if the form must be displayed or not
 */
function getPurchaseSummaryForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		getPurchaseSummaryForm_fillIn();
		$('form[name="getPurchaseSummaryForm"]').show();
	}
	else {
		$('form[name="getPurchaseSummaryForm"]').hide();
		
		if ($.settings.user && $.settings.user.getPurchaseSummary != undefined && $.settings.user.getPurchaseSummary.show == true) {
			$('#getPurchaseSummaryLink_link').show();
		}
		else {
			$('#getPurchaseSummaryLink_link').hide();
		}
	}
}

function getPurchaseSummaryForm_fillIn(displayLang) {
	if ($.settings.user != undefined && $.settings.user.getPurchaseSummary != undefined) {
		var getPurchaseSummarySettings = $.settings.user.getPurchaseSummary;
		
		if (getPurchaseSummarySettings.amount != undefined) {
			$('#getPurchaseSummaryForm_amount_value').text(getPurchaseSummarySettings.amount.value);
		}
		else {
			$('#getPurchaseSummaryForm_amount_value').text('');
		}
		
		if (getPurchaseSummarySettings.downloadLink != undefined) {
			$('#getPurchaseSummaryForm_download_link').attr("href", getPurchaseSummarySettings.downloadLink.value);
		}
		else {
			$('#getPurchaseSummaryForm_download_link').attr("href", "#");
		}
	}
}

/** Enable waiting mode on getPurchaseSummaryForm
 */
function getPurchaseSummaryFormWaiting(state) {
	switch (state) {
		case true:
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when button is clicked
 */
function getPurchaseSummaryFormGenerate() {

	var params = new Object();
	// Mandatory parameters
	params.login = $.settings.user.login.value;
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { getPurchaseSummaryFormWaiting(true); };
	callbacks.success    = function() { getPurchaseSummaryFormGenerateCallback(); };
	callbacks.complete   = function() { getPurchaseSummaryFormWaiting(false); };
	
	getPurchaseSummary(callbacks, params);
}

/** Executed on return of getPurchaseSummaryFormConfirm function
 */
function getPurchaseSummaryFormGenerateCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		getPurchaseSummaryLink_display();
	}
}

/*****************************************************************************/

/** Display getPurchaseSummaryLink_block depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function getPurchaseSummaryLink_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.user == undefined) || ($.settings.user.getPurchaseSummaryForm == undefined) || ($.settings.user.getPurchaseSummaryForm.display != true) ) {
		display = true;
	}
	else {
		display = false;
	}
	
	if ($.settings.user == undefined) {
		$.settings.user = new Object();
	}
	if ($.settings.user.getPurchaseSummaryForm == undefined) {
		$.settings.user.getPurchaseSummaryForm = new Object();
	}
	$.settings.user.getPurchaseSummaryForm.display = display;
	getPurchaseSummaryForm_display(display);
	// We display the opposite the feedback
	feedbackForm_display(!display);
}


/*****************************************************************************/
/****          Get Purchase Summary Form JavaScript functions           ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Input triggers
	 */
	$('form[name="upgradeAccountForm"] input[name="multidevice"]').keyup(function() {
		upgradeAccountForm_change();
	});
	
	
	
	/** Buttons triggers
	 */
	
	$('#upgradeAccountFormLinks_back_button').click(function() {
		upgradeAccountFormLink_display(false);
	});
	$('#upgradeAccountFormMultidevice_back_button').click(function() {
	    	upgradeAccountCheckForm_display(false);
	    	upgradeAccountOgoneRedirectForm_display(false);
	    	upgradeAccountFormLink_display(false);
	    	manageAccountForm_display(true);
	});
	$('#upgradeAccountFormMultidevice_update_button').click(function() {
		upgradeAccountForm_getAmount();
	});
	$('#upgradeAccountCheckForm_back_button').click(function() {
	    	upgradeAccountCheckForm_display(false);	    
	    	upgradeAccountFormLink_display(false);
	    	manageAccountForm_display(true);
	});
	$('#upgradeAccountCheckForm_check_button').click(function() {
		upgradeAccountCheckForm_check();
	});
	$('#upgradeAccountOgoneRedirectForm_pay_button').click(function() {
		upgradeAccountOgoneRedirectForm_pay();
	});
	
	/** Form triggers
	 */
	$('form[name="upgradeAccountForm"]').submit(function() {
		return false;
	});
	$('form[name="upgradeAccountResultForm"]').submit(function() {
		return false;
	});
	
	/** Link triggers
	 */
	$('#upgradeAccountLink_link').click(function() {
		upgradeAccountForm_links_display(true);
		manageAccountForm_display(false);
	});
	$('#upgradeAccountFormLinks_add_simultaneous_connection_link').click(function() {
	    	manageAccountForm_display(false);
	    	upgradeAccountFormGenerate();
	});
	$('#upgradeAccountFormLinks_check_payment_link').click(function() {
		upgradeAccountCheckForm_display(true);
		manageAccountForm_display(false);
	});
});

/** Configure upgradeAccountForm depending on settings
 */
function upgradeAccountForm_configure() {
	// Configure display
	if (!$.settings.upgradeAccount) {
		$('form[name="upgradeAccountForm"]').remove();
		$('form[name="upgradeAccountResultForm"]').remove();
		$('form[name="upgradeAccountOgoneRedirectForm"]').remove();
		$('#upgradeAccountForm_links_explain_text').remove();
		$('#upgradeAccountFormLinks_add_simultaneous_connection_link').remove();
		$('#upgradeAccountFormLinks_check_payment_link').remove();
		$('#upgradeAccountForm_explain_text').remove();
		$('#upgradeAccountForm_separator').remove();
	}
}

/** Display upgradeAccountForm depending on settings
 * @param boolean state - Indicate if the form must be displayed or not
 */
function upgradeAccountForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		upgradeAccountForm_fillIn();
		$('form[name="upgradeAccountForm"]').show();
	}
	else {
		$('form[name="upgradeAccountForm"]').hide();
		
		if ($.settings.user && $.settings.user.upgradeAccount != undefined && $.settings.user.upgradeAccount.show == true) {
		    upgradeAccountForm_links_in_manage_display(true);
		}
		else {
		    upgradeAccountForm_links_in_manage_display(false);
		}
	}
}

function upgradeAccountForm_links_in_manage_display(state) {
    if(state == true) {
	$('#upgradeAccountForm_links_explain_text').show();
	$('#upgradeAccountFormLinks_add_simultaneous_connection_link').show();
	$('#upgradeAccountFormLinks_check_payment_link').show();
    	$('#upgradeAccountForm_explain_text').show();
    	$('#upgradeAccountForm_separator').show();
    }
    else {
	$('#upgradeAccountForm_links_explain_text').hide();
    	$('#upgradeAccountFormLinks_add_simultaneous_connection_link').hide();
    	$('#upgradeAccountFormLinks_check_payment_link').hide();
    	$('#upgradeAccountForm_explain_text').hide();
    	$('#upgradeAccountForm_separator').hide();
    }
}

function upgradeAccountForm_links_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		upgradeAccountForm_change();
		upgradeAccountCheckForm_display(false);
		upgradeAccountForm_addSimultaneousConnection_display(false);
		upgradeAccountFormLink_display(true);
	}
}

function upgradeAccountForm_addSimultaneousConnection_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		// Restore clean state
		upgradeAccountForm_empty();
		upgradeAccountOgoneRedirectForm_empty();
		upgradeAccountOgoneRedirectForm_display(false);
		upgradeAccountForm_links_display(false);
		upgradeAccountCheckForm_display(false);
		$('#upgradeAccountFormMultidevice').show();
		upgradeAccountForm_display(true);
	}
	else {
		$('#upgradeAccountFormMultidevice').hide();
	}
}

function upgradeAccountCheckForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		upgradeAccountForm_display(false);
		upgradeAccountOgoneRedirectForm_display(false);
		$('form[name="upgradeAccountCheckForm"]').show();
	}
	else {
		$('form[name="upgradeAccountCheckForm"]').hide();
	}
}

function upgradeAccountOgoneRedirectForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		$('form[name="upgradeAccountOgoneRedirectForm"]').show();
		$('#upgradeAccountFormMultidevice_update_block').hide();
	}
	else {
		$('form[name="upgradeAccountOgoneRedirectForm"]').hide();
		$('#upgradeAccountFormMultidevice_update_block').show();
	}
}

function upgradeAccountForm_fillIn(displayLang) {
	if ($.settings.user != undefined && $.settings.user.upgradeAccount != undefined && $.settings.user.upgradeAccount.package!= undefined ) {
		var upgradeAccountPackage = $.settings.user.upgradeAccount.package;
		$(upgradeAccountPackage).each(function () {
			var package = $(this)[0];
			var text;
			var currencyLanguage;
			if (package[displayLang] != undefined) {
				text = package[displayLang].text;
				currencyLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
			}
			else {
				text = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
			}
			$('#upgradeAccountForm_package_description_value').text(text);
			
			// Add currency
			$('#upgradeAccountForm_amount_currency').text((package['currency'] == "free") ? getGenericTranslation('free_package', currencyLanguage) : package['currency']);
		});
	}
	else {
		$('#upgradeAccountForm_package_description_value').text('');
	}
}

/** Empty directSubscriptionForm
 */
function upgradeAccountForm_empty() {
	
	$('form[name="upgradeAccountForm"] input[type="text"]').each(function() {
		$(this).val('');
	});
	
	$('#upgradeAccountForm_amount_value').text("-");
}

function upgradeAccountForm_change() {
	
	$('#upgradeAccountForm_amount_value').text("-");
	upgradeAccountOgoneRedirectForm_empty();
	upgradeAccountOgoneRedirectForm_display(false);
}

/** Executed when multidevice input is changed
 */
function upgradeAccountForm_getAmount() {

	var params = new Object();
	
	// Mandatory parameters
	params.login = $.settings.user.login.value;
	params.multidevice = $('form[name="upgradeAccountForm"] input[name="multidevice"]').val();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { upgradeAccountForm_waiting(true); };
	callbacks.success    = function() { upgradeAccountForm_getOrderCallback(); };
	callbacks.complete   = function() { upgradeAccountForm_waiting(false); };
	
	getUpgradeOrder(callbacks, params);
}

/** Enable waiting mode on upgradeAccountForm
 */
function upgradeAccountForm_waiting(state) {
	switch (state) {
		case true:
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function upgradeAccountForm_getOrderCallback() {
	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.user != undefined && $.settings.user.upgradeAccount != undefined && $.settings.user.upgradeAccount.amount != undefined ) {
			$('#upgradeAccountForm_amount_value').text($.settings.user.upgradeAccount.amount.value);
			upgradeAccountOgoneRedirectForm_fillIn();
			upgradeAccountOgoneRedirectForm_display(true);
		}
	}
}

function upgradeAccountOgoneRedirectForm_fillIn()
{
	if ($.settings.user != undefined && $.settings.user.upgradeAccount != undefined && $.settings.user.upgradeAccount.payment != undefined) {
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="encrypted"]').val($.settings.user.upgradeAccount.payment.packageEncr);
		$('form[name="upgradeAccountOgoneRedirectForm"]').attr('action', $.settings.user.upgradeAccount.payment.ogoneUrlPost);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="PSPID"]').val($.settings.user.upgradeAccount.payment.pspid);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="USERID"]').val($.settings.user.upgradeAccount.payment.userid);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="PSWD"]').val($.settings.user.upgradeAccount.payment.userpassword);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="ORDERID"]').val($.settings.user.upgradeAccount.payment.orderid);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="AMOUNT"]').val($.settings.user.upgradeAccount.payment.amount);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="CURRENCY"]').val($.settings.user.upgradeAccount.payment.currency);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="LANGUAGE"]').val($.settings.user.upgradeAccount.payment.language);
		$('form[name="upgradeAccountOgoneRedirectForm"] input[name="SHASIGN"]').val($.settings.user.upgradeAccount.payment.shasign);
	}
}

function upgradeAccountOgoneRedirectForm_empty()
{
	$('form[name="upgradeAccountOgoneRedirectForm"] input[type="hidden"]').each(function() {
		$(this).val('');
	});
	$('form[name="upgradeAccountOgoneRedirectForm"]').removeAttr('action');
}

function upgradeAccountOgoneRedirectForm_pay()
{
	var params = new Object();
	params.login   = $.settings.user.login.value;
	params.orderId = $.settings.user.upgradeAccount.payment.orderid;
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { ogonePaymentFormWaiting(true); };
	callbacks.success    = function() { upgradeAccountOgoneRedirectForm_payCallback(); };
	callbacks.complete   = function() { ogonePaymentFormWaiting(false); };
	
	updateUpgradeOrder(callbacks, params);
}

/** Executed on return of upgradeAccountOgoneRedirectForm_pay function
 */
function upgradeAccountOgoneRedirectForm_payCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		upgradeAccountCheckForm_display(true);
	}
}

function upgradeAccountCheckForm_check()
{
	var params = new Object();
	params.login   = $.settings.user.login.value;
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { ogonePaymentFormWaiting(true); };
	callbacks.success    = function() { upgradeAccountCheckForm_checkCallback(); };
	callbacks.complete   = function() { ogonePaymentFormWaiting(false); };
	
	checkUpgradeOrder(callbacks, params);
}

/** Executed on return of upgradeAccountCheckForm_check function
 */
function upgradeAccountCheckForm_checkCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		upgradeAccountFormLink_display(false);
		upgradeAccountCheckForm_display(false);
	}
}

/** Executed when link is clicked
 */
function upgradeAccountFormGenerate() {

	var params = new Object();
	// Mandatory parameters
	params.login = $.settings.user.login.value;
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { upgradeAccountForm_waiting(true); };
	callbacks.success    = function() { upgradeAccountFormGenerateCallback(); };
	callbacks.complete   = function() { upgradeAccountForm_waiting(false); };
	
	getCurrentPackage(callbacks, params);
}

/** Executed on return of getPurchaseSummaryFormConfirm function
 */
function upgradeAccountFormGenerateCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		upgradeAccountForm_fillIn();
		upgradeAccountForm_addSimultaneousConnection_display(true);
	}
}

/*****************************************************************************/

/** Display upgradeAccountForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function upgradeAccountFormLink_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.user == undefined) || ($.settings.user.upgradeAccountForm == undefined) || ($.settings.user.upgradeAccountForm.display != true) ) {
		display = true;
	}
	else {
		display = false;
	}
	
	if ($.settings.user == undefined) {
		$.settings.user = new Object();
	}
	if ($.settings.user.upgradeAccountForm == undefined) {
			$.settings.user.upgradeAccountForm = new Object();
	}
	$.settings.user.upgradeAccountForm.display = display;
	upgradeAccountForm_display(display);
	// We display the opposite the feedback
	feedbackForm_display(!display);
}



/*****************************************************************************/
/****           Password Recovery Form JavaScript functions               ****/
/*****************************************************************************/

/** Listen to modified element
 */
var pwdRecoveryForm_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {
	
	/** Inputs triggers
	 */
	$('form[name="pwdRecoveryForm"] input[name="prefix"]').focus(function() {
		pwdRecoveryForm_modifyEvent('focus', $(this));
		pwdRecoveryForm_phoneHelpBlock_display(true);
	});
	
	$('form[name="pwdRecoveryForm"] input[name="prefix"]').blur(function() {
		pwdRecoveryForm_modifyEvent('blur', $(this));
	});
	
	$('form[name="pwdRecoveryForm"] input[name="phone"]').focus(function() {
		pwdRecoveryForm_modifyEvent('focus', $(this));
		pwdRecoveryForm_phoneHelpBlock_display(true);
	});
	
	$('form[name="pwdRecoveryForm"] input[name="phone"]').blur(function() {
		pwdRecoveryForm_modifyEvent('blur', $(this));
	});
	
	/** Form triggers
	 */
	$('form[name="pwdRecoverySetForm"]').submit(function() {
		return false;
	});
	
	$('form[name="pwdRecoveryForm"]').submit(function() {
		return false;
	});
	
	$('form[name="pwdRecoveryResendForm"]').submit(function() {
		return false;
	});
	
	$('form[name="pwdRecoveryResendResultForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#logonForm_forgotPasswordLink_link').click(function() {
		pwdRecoveryForm_display(true);
		logonForm_display(false);
	});
	
	$('#pwdRecoveryForm_phone_help_link').click(function() {
		pwdRecoveryForm_phoneHelpBlock_display();
	});
	
	$('#pwdRecoveryResendForm_sms_link').click(function() {
		pwdRecoveryResendForm_sendBySms();
	});
	
	$('#pwdRecoveryResendForm_email_link').click(function() {
		pwdRecoveryResendForm_sendByEmail();
	});
	
	$('#pwdRecoveryResendForm_questions_link').click(function() {
		pwdRecoveryResendForm_questions_block_display(true);
		$('#pwdRecoveryResendForm_links_block').hide();
	});
	
	$('#pwdRecoverySetLink_link').click(function() {
		pwdRecoverySetForm_display(true);
		manageAccountForm_display(false);
	});

	/** Buttons triggers
	 */
	$('#pwdRecoveryForm_back_button').click(function() {
		logonForm_display(true);
		pwdRecoveryForm_display(false);
	});
	
	$('#pwdRecoveryForm_confirm_button').click(function() {
		pwdRecoveryForm_confirm();
	});
	
	$('#pwdRecoveryResendForm_questions_back_button').click(function() {
		pwdRecoveryResendForm_questions_block_display(false);
		if ($.settings.user.pwdRecovery.modes.sms == true || $.settings.user.pwdRecovery.modes.email == true)
		{
			pwdRecoveryResendForm_display(true);
		}
		else {
			pwdRecoveryResendForm_display(false);
			pwdRecoveryForm_display(true);
		}
		
	});
	
	$('#pwdRecoveryResendForm_questions_update_button').click(function() {
		pwdRecoveryResendForm_sendByQuestions();
	});
	
	$('#pwdRecoveryResendForm_back_button').click(function() {
		pwdRecoveryResendForm_display(false);
		pwdRecoveryForm_display(true);
	});
	
	$('#pwdRecoverySetForm_back_button').click(function() {
		pwdRecoverySetForm_display(false);
		manageAccountForm_display(true);
	});
	
	$('#pwdRecoverySetForm_update_button').click(function() {
		pwdRecoverySetForm_update();
	});
	
	$('#pwdRecoveryResendResultForm_back_button').click(function() {
		logonForm_display(true);
		pwdRecoveryResendResultForm_display(false);
	});
	
});

// Live event bindings
$(document).delegate('form[name="pwdRecoverySetForm"] select', "change", pwdRecoverySetForm_updateQuestionChoices);

/** Configure pwdRecoveryForm depending on settings
 */
function pwdRecoveryForm_configure() {

	// Configure display
	if ($.settings.pwdRecovery == true) {
		$('#logonForm_forgotPasswordLink').show();
		// Configure help block
		pwdRecoveryForm_phoneHelpBlock_configure();
	}
	else {
		$('form[name="pwdRecoveryForm"]').remove();
	}
}

/** Display pwdRecoveryForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function pwdRecoveryForm_display(state) {
	
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if (display == true) {
		$('form[name="pwdRecoveryForm"]').show();
	}
	else {
		$('form[name="pwdRecoveryForm"]').hide();
// 		$('form[name="pwdRecoveryForm"] tr[id$="_block"]').hide();
		pwdRecoveryForm_empty();
	}
	pwdRecoveryForm_phoneHelpBlock_display(false);
}

/** Empty pwdRecoveryForm
 */
function pwdRecoveryForm_empty() {
	
	$('form[name="pwdRecoveryForm"] input').each(function() {
		$(this).val('');
	});
	
	// Adding examples values
	pwdRecoveryForm_phoneHelpBlock_configure();
	
	pwdRecoveryForm_changed['prefix'] = false;
	pwdRecoveryForm_changed['phone'] = false;
}

/** Configure directSubscriptionForm_phone_block
 * @param string displayLang - The language whish to display the content
 */
function pwdRecoveryForm_phoneHelpBlock_configure(displayLang) {
	if (pwdRecoveryForm_changed['prefix'] != true) {
		$('#pwdRecoveryForm_phone_prefix_value').val(getInputTranslation("pwdRecoveryForm_phone_prefix_value", displayLang));
	}
	if (pwdRecoveryForm_changed['phone'] != true) {
		$('#pwdRecoveryForm_phone_phone_value').val(getInputTranslation("pwdRecoveryForm_phone_phone_value", displayLang));
	}
	$('#pwdRecoveryForm_phone_help_prefix_example_value').val(getInputTranslation("pwdRecoveryForm_phone_help_prefix_example_value", displayLang));
	$('#pwdRecoveryForm_phone_help_phone_example_value').val(getInputTranslation("pwdRecoveryForm_phone_help_phone_example_value", displayLang));
}

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function pwdRecoveryForm_modifyEvent(type, element) {
	switch (type) {
		case 'focus':
			if (pwdRecoveryForm_changed[element.attr("name")] != true) {
				element.val("");
			}
			break;
			
		case 'blur':
			if (element.val() == "") {
				element.val(getInputTranslation(element.attr("id")));
				pwdRecoveryForm_changed[element.attr("name")] = false;
			}
			else {
				pwdRecoveryForm_changed[element.attr("name")] = true;
			}
			break;
	}
}

/** Display pwdRecoveryForm_phone_help_block when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function pwdRecoveryForm_phoneHelpBlock_display(state) {
	
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#pwdRecoveryForm_phone_help_block').is(':hidden') == true) {
		display = true;
	}
	
	if (display == true) {
		$('#pwdRecoveryForm_phone_help_block').show();
	}
	else {
		$('#pwdRecoveryForm_phone_help_block').hide();
	}
}

function pwdRecoveryForm_confirm() {
	var params = new Object();
	
	params.login = $('form[name="pwdRecoveryForm"] input[name="login"]').val();
	params.emailAddress = $('form[name="pwdRecoveryForm"] input[name="email"]').val();
	params.prefix = (pwdRecoveryForm_changed['prefix'] == true) ? $('form[name="pwdRecoveryForm"] input[name="prefix"]').val() : "";
	params.phone = (pwdRecoveryForm_changed['phone'] == true) ? $('form[name="pwdRecoveryForm"] input[name="phone"]').val() : "";
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	//Re-init settings to get up to date infos, caused by $.extend use, merging returned ajax data
	$.settings.user.pwdRecovery = undefined;

	var callbacks = new Object();
	callbacks.beforeSend = function() { pwdRecoveryFormWaiting(true); };
	callbacks.success    = function() { pwdRecoveryForm_confirmCallback(); };
	callbacks.complete   = function() { pwdRecoveryFormWaiting(false); };
	
	getPwdRecoveryOptionsFromUser(callbacks, params);
}

/** Executed on return of pwdRecoveryForm_update function
 */
function pwdRecoveryForm_confirmCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		pwdRecoveryResendForm_display(true);
		pwdRecoveryForm_display(false);
		pwdRecoveryResendForm_questions_block_display(false);
	}
}

/** Enable waiting mode on pwdRecoverySetForm
 */
function pwdRecoveryFormWaiting(state) {
	switch (state) {
		case true:
			$('form[name="pwdRecoveryForm"] button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="pwdRecoveryForm"] button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function pwdRecoveryResendForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if (display == true) {
		$('form[name="pwdRecoveryResendForm"]').show();
		
		if ($.settings.user != undefined && $.settings.user.pwdRecovery != undefined && $.settings.user.pwdRecovery.modes != undefined) {
			// Display modes
			if ($.settings.user.pwdRecovery.modes.questions == true) {
				$('#pwdRecoveryResendForm_questions_link_block').show();
			}
			else
			{
				$('#pwdRecoveryResendForm_questions_link_block').hide();
			}
			if ($.settings.user.pwdRecovery.modes.sms == true) {
				$('#pwdRecoveryResendForm_sms_link_block').show();
			}
			else
			{
				$('#pwdRecoveryResendForm_sms_link_block').hide();
			}
			if ($.settings.user.pwdRecovery.modes.email == true) {
				$('#pwdRecoveryResendForm_email_link_block').show();
			}
			else
			{
				$('#pwdRecoveryResendForm_email_link_block').hide();
			}
			if ($.settings.user.pwdRecovery.modes.sms == true || $.settings.user.pwdRecovery.modes.email == true || $.settings.user.pwdRecovery.modes.questions == true)
			{
				$('#pwdRecoveryResendForm_links_block').show();
			}
			pwdRecoveryResendForm_questions_block_display($.settings.user.pwdRecovery.modes.questions);
		}
	}
	else {
		$('form[name="pwdRecoveryResendForm"]').hide();
		pwdRecoveryResendForm_empty();
	}
}

function pwdRecoveryResendForm_questions_block_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if (display == true)
	{
		pwdRecoveryResendForm_fillInQuestions();
		$('#pwdRecoveryResendForm_questions_block').show();
	}
	else
	{
		$('#pwdRecoveryResendForm_questions_block').hide();
		pwdRecoveryResendForm_empty();
	}
}

function pwdRecoveryResendForm_empty() {
	$('form[name="pwdRecoveryResendForm"] tr[id^="pwdRecoveryResendForm_question_"][id$="_block"][id!="pwdRecoveryResendForm_question_base_block"]').remove();
// 	$('form[name="pwdRecoveryResendForm"] input').each(function() {
// 		$(this).val('');
// 	});
}

function pwdRecoveryResendForm_fillInQuestions(displayLang) {
	if ($.settings != undefined && $.settings.user != undefined && $.settings.user.pwdRecovery != undefined && $.settings.user.pwdRecovery.questions != undefined) {
		var questions = $.settings.user.pwdRecovery.questions;
		var availableQuestions = $.settings.user.pwdRecovery.availableQuestions;
		
		$.each(questions, function(questionIndex, questionValue) {
			var clone = $('#pwdRecoveryResendForm_question_base_block').clone().show();
			$(clone).attr("id", $(clone).attr("id").replace("_base", "_" + questionIndex));
			$(clone).find('span').each(function() {
				$(this).attr("id", $(this).attr("id").replace("_base", "_" + questionIndex));
				if (getGenericTranslation('pwdRecoverySecretQuestion_' + questionValue, displayLang) != "")
				{
					$(this).text(getGenericTranslation('pwdRecoverySecretQuestion_' + questionValue, displayLang));
				}
			});
			$(clone).find('input').each(function() {
				$(this).attr("name", $(this).attr("name").replace("_base", "_" + questionIndex));
			});
			$(clone).insertBefore($('#pwdRecoveryResendForm_question_base_block'));
		});
	}
}

function pwdRecoveryResendForm_questionsTranslate(displayLang) {
	if (displayLang == undefined) {
		if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != null) {
			displayLang = $.settings.user.lang;
		}
		else {
			displayLang = $.settings.lang.defaultLang;
		}
	}
	pwdRecoveryResendForm_empty();
	pwdRecoveryResendForm_fillInQuestions(displayLang);
}

function pwdRecoveryResendForm_sendBySms()
{
	var params = new Object();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { pwdRecoveryResendFormWaiting(true); };
	callbacks.success    = function() { pwdRecoveryResendForm_sendCallback(); };
	callbacks.complete   = function() { pwdRecoveryResendFormWaiting(false); };
	
	regenPwdWithSmsResend(callbacks, params);
}

function pwdRecoveryResendForm_sendByEmail()
{
	var params = new Object();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { pwdRecoveryResendFormWaiting(true); };
	callbacks.success    = function() { pwdRecoveryResendForm_sendCallback(); };
	callbacks.complete   = function() { pwdRecoveryResendFormWaiting(false); };
	
	regenPwdWithEmailResend(callbacks, params);
}

function pwdRecoveryResendForm_sendCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		logonForm_display(true);
		pwdRecoveryResendForm_display(false);
	}
}

function pwdRecoveryResendForm_sendByQuestions()
{
	var params = new Object();
	
	$('form[name="pwdRecoveryResendForm"] input[name^="answer_"]').each(function() {
		params[$(this).attr("name")] = $.trim($(this).val());
	});
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { pwdRecoveryResendFormWaiting(true); };
	callbacks.success    = function() { pwdRecoveryResendForm_sendByQuestionsCallback(); };
	callbacks.complete   = function() { pwdRecoveryResendFormWaiting(false); };
	
	regenPwdWithSecretQuestions(callbacks, params);
}

function pwdRecoveryResendForm_sendByQuestionsCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		pwdRecoveryResendResultForm_fillIn($.settings.info.pwdRecovery.password);
		pwdRecoveryResendResultForm_display(true);
		pwdRecoveryResendForm_display(false);
	}
}

function pwdRecoveryResendFormWaiting(state) {
	switch (state) {
		case true:
			$('form[name="pwdRecoveryResendForm"] button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="pwdRecoveryResendForm"] button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function pwdRecoverySetForm_configure() {
	// Moving link to right location
	$('#pwdRecoverySetLink').appendTo('#manageAccountForm_links_others_links_block td');
}

function pwdRecoverySetForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if ($.settings != undefined && $.settings.user != undefined && $.settings.user.pwdRecovery != undefined) {
		$('#pwdRecoverySetLink').show();
	}
	else {
		$('#pwdRecoverySetLink').hide();
	}
	
	if (display == true) {
		pwdRecoverySetForm_fillInQuestions();
		$('form[name="pwdRecoverySetForm"]').show();
		manageAccountForm_links_display(false);
	}
	else {
		$('form[name="pwdRecoverySetForm"]').hide();
		pwdRecoverySetForm_empty();
	}
}

function pwdRecoverySetForm_fillInQuestions() {
	
	
	if ($.settings != undefined && $.settings.user != undefined && $.settings.user.pwdRecovery != undefined) {
		for (var itt = 0; itt < $.settings.user.pwdRecovery.maxQuestions; itt++) {
			var questions = $.settings.user.pwdRecovery.availableQuestions;
			
			var clone = $('#pwdRecoverySetForm_question_base_block').clone().show();
			$(clone).attr("id", $(clone).attr("id").replace("_base", "_" + itt));
			$(clone).find('pwdRecoverySetForm_question_base_default_option').each(function() {
				$(this).id("id", $(this).attr("id").replace("_base", "_" + itt));
			});
			$(clone).find('select').each(function() {
				var select = $(this).attr("name", $(this).attr("name").replace("_base", "_" + itt));

				$.each(questions, function(questionIndex, questionValue) {
					$(select).append('<option value="' + questionValue + '">' + questionValue + '</option>');
				});
			});
			$(clone).find('input').each(function() {
				$(this).attr("name", $(this).attr("name").replace("_base", "_" + itt));
			});
			
			// Set users values
			if ($.settings.user.pwdRecovery.questions != undefined && $.settings.user.pwdRecovery.questions[itt] != undefined && $.settings.user.pwdRecovery.answers[itt]) {
				$(clone).find('select').each(function() {
					$(this).val($.settings.user.pwdRecovery.questions[itt]);
				});
			
				$(clone).find('input').each(function() {
					$(this).val($.settings.user.pwdRecovery.answers[itt]);
				});
			}
			
			$(clone).insertBefore($('#pwdRecoverySetForm_question_base_block'));
		}
	}
	pwdRecoverySetForm_questionsTranslate();
	pwdRecoverySetForm_updateQuestionChoices();
}

function pwdRecoverySetForm_empty() {
	$('form[name="pwdRecoverySetForm"] tr[id^="pwdRecoverySetForm_question_"][id$="_block"][id!="pwdRecoverySetForm_question_base_block"]').remove();
}

function pwdRecoverySetForm_questionsTranslate(displayLang) {
	$('form[name="pwdRecoverySetForm"] select option').each(function() {
		if (getGenericTranslation('pwdRecoverySecretQuestion_' + $(this).val(), displayLang) != "")
		{
			$(this).text(getGenericTranslation('pwdRecoverySecretQuestion_' + $(this).val(), displayLang));
		}
	});
}

function pwdRecoverySetForm_updateQuestionChoices() {
	var selectedQuestions = new Array();
	// Gather selected questions
	$('form[name="pwdRecoverySetForm"] select').each(function() {
		if ($(this).val() != "")
		{
			selectedQuestions.push($(this).val());
		}
	});
	
	// Disable this options in others select list
	$('form[name="pwdRecoverySetForm"] select').each(function() {
		var selectValue = $(this).val();
		
		$(this).find('option').each(function() {
			$(this).attr('disabled', false).show();
			if ( ($.inArray($(this).val(), selectedQuestions) != -1) && (selectValue != $(this).val()) )
			{
				$(this).attr('disabled', true).hide();
			}
		});
	});
}

/** Enable waiting mode on pwdRecoverySetForm
 */
function pwdRecoverySetFormWaiting(state) {
	switch (state) {
		case true:
			$('form[name="pwdRecoverySetForm"] button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="pwdRecoverySetForm"] button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function pwdRecoverySetForm_update() {
	
	var params = new Object();
	
	$('form[name="pwdRecoverySetForm"] select[name^="question_"]').each(function() {
		params[$(this).attr("name")] = $(this).val();
	});
	
	$('form[name="pwdRecoverySetForm"] input[name^="answer_"]').each(function() {
		params[$(this).attr("name")] = $.trim($(this).val());
	});
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { pwdRecoverySetFormWaiting(true); };
	callbacks.success    = function() { pwdRecoverySetForm_updateCallback(); };
	callbacks.complete   = function() { pwdRecoverySetFormWaiting(false); };
	
	updatePwdRecoverySecretQuestions(callbacks, params);
}

/** Executed on return of pwdRecoverySetForm_update function
 */
function pwdRecoverySetForm_updateCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		manageAccountForm_display(true);
		pwdRecoverySetForm_display(false);
	}
}

function pwdRecoveryResendResultForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if (display == true) {
		$('form[name="pwdRecoveryResendResultForm"]').show();
	}
	else {
		$('form[name="pwdRecoveryResendResultForm"]').hide();
		pwdRecoveryResendResultForm_empty();
	}
}

function pwdRecoveryResendResultForm_fillIn(newPassword) {
	$('form[name="pwdRecoveryResendResultForm"] #pwdRecoveryResendResultForm_password_value').text(newPassword);
}

function pwdRecoveryResendResultForm_empty() {
	$('form[name="pwdRecoveryResendResultForm"] #pwdRecoveryResendResultForm_password_value').text('');
}


/*****************************************************************************/
/****          Manage Account Form JavaScript functions                   ****/
/*****************************************************************************/

/** Listen to modified element
 */
var manageAccountForm_personal_settings_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Input triggers
	 */
	$('form[name="manageAccountForm"] input[name="prefix"]').focus(function() {
		manageAccountForm_personal_settings_modifyEvent('focus', $(this));
		manageAccountForm_personal_settings_phoneHelpBlock_display(true);
	});

	$('form[name="manageAccountForm"] input[name="prefix"]').blur(function() {
		manageAccountForm_personal_settings_modifyEvent('blur', $(this));
	});

	$('form[name="manageAccountForm"] input[name="phone"]').focus(function() {
		manageAccountForm_personal_settings_modifyEvent('focus', $(this));
		manageAccountForm_personal_settings_phoneHelpBlock_display(true);
	});

	$('form[name="manageAccountForm"] input[name="phone"]').blur(function() {
		manageAccountForm_personal_settings_modifyEvent('blur', $(this));
	});

	/** Buttons triggers
	 */
	$('#manageAccountForm_links_back_button').click(function() {
		displayStep();
	});
	$('#manageAccountForm_personal_settings_back_button').click(function() {
		manageAccountForm_display(true);
	});
	$('#manageAccountForm_personal_settings_update_button').click(function() {
		manageAccountForm_personal_settings_update();
	});
	$('#manageAccountForm_devices_back_button').click(function() {
		manageAccountForm_display(true);
	});
	$('#manageAccountForm_devices_update_button').click(function() {
		manageAccountForm_devices_update();
	});

	/** Form triggers
	 */
	$('form[name="manageAccountForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#manageAccountLink_link').click(function() {
		manageAccountForm_display(true);
	});
	$('#manageAccountForm_links_personal_settings_link').click(function() {
		manageAccountForm_personal_settings_display(true);
		manageAccountForm_devices_display(false);
		manageAccountForm_personal_settings_phoneHelpBlock_display(false);
	});

	$('#manageAccountForm_links_devices_link').click(function() {
		manageAccountForm_devices_display(true);
		manageAccountForm_personal_settings_display(false);
	});

	$('#manageAccountForm_links_account_refill_link').click(function() {
		accountRefillForm_configure();
		accountRefillForm_display(true);
		manageAccountForm_display(false);
	});

	$('#manageAccountForm_personal_settings_phone_help_link').click(function() {
		manageAccountForm_personal_settings_phoneHelpBlock_display();
	});
	$('#manageAccountForm_links_modify_my_package_link').click(function() {
		modifyPackageForm_package_update();
	});
});

// Live event bindings
$(document).delegate('#manageAccountForm_devices_block div.trashButton', "click", manageAccountForm_devices_delete);

/** Configure manageAccountForm depending on settings
 */
function manageAccountForm_configure() {
	// Moving link to right location
	$('#manageAccountLink').appendTo('#feedbackForm_settings_link td');
}

/** Display manageAccountForm depending on settings
 * @param boolean state - Indicate if the form must be displayed or not
 */
function manageAccountForm_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if ($.settings.user.manageAccount == true) {
		$('#manageAccountLink').show();
	}
	else {
		$('#manageAccountLink').hide();
	}
	manageAccountForm_links_display(true);
	manageAccountForm_devices_display(false);
	manageAccountForm_personal_settings_display(false);

	if (display == true) {
		$('form[name="manageAccountForm"]').show();
		feedbackForm_display(false);
	}
	else {
		$('form[name="manageAccountForm"]').hide();
	}
}

function manageAccountForm_links_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if ($.settings.user.managePersonalSettings == true) {
		$('#manageAccountForm_links_personal_settings_link_block').show();
	}
	else {
		$('#manageAccountForm_links_personal_settings_link_block').hide();
	}

	// Display devices management link
	if ($.settings.user.manageDevices == true) {
		$('#manageAccountForm_links_devices_link_block').show();
	}
	else {
		$('#manageAccountForm_links_devices_link_block').hide();
	}

	// Display change package link
	if ($.settings.user.allowmodifypackage == true) {
		$('#manageAccountForm_links_modify_my_package_block').show();
	}
	else {
		$('#manageAccountForm_links_modify_my_package_block').hide();
	}

	// Display account refill link
	if ($.settings.accountRefill == true) {
		$('#manageAccountForm_links_account_refill_link_block').show();
	}
	else {
		$('#manageAccountForm_links_account_refill_link_block').hide();
	}

	if (display == true) {
		$('#manageAccountForm_links_block').show();
	}
	else {
		$('#manageAccountForm_links_block').hide();
	}
}

function manageAccountForm_personal_settings_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if (display == true) {
		manageAccountForm_personal_settings_fillIn();
		$('#manageAccountForm_personal_settings_block').show();
		manageAccountForm_links_display(false);
	}
	else {
		$('#manageAccountForm_personal_settings_block').hide();
		manageAccountForm_personal_settings_empty();
	}
}

function manageAccountForm_devices_display(state) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		manageAccountForm_devices_fillIn();
		$('#manageAccountForm_devices_block').show();
		manageAccountForm_links_display(false);
	}
	else {
		$('#manageAccountForm_devices_block').hide();
		manageAccountForm_devices_empty();
	}
}

function manageAccountForm_personal_settings_fillIn() {
	if ($.settings != undefined && $.settings.user != undefined) {
		displayLang = $.settings.user.lang;
	}

	if ($.settings.user != undefined)
	{
		var userSettings = $.settings.user;
		var creationModeRegExp = new RegExp("^portal-([a-zA-Z_-]+)$");
		var creationModeMatches = creationModeRegExp.exec($.settings.user.creationMode.value);
		var defaultBehavior = false;
		if (creationModeMatches != undefined) {
			var creationMode = creationModeMatches[1];
			var creationModeSettings = $.settings.subscribe[creationMode];
		}
		else {
			// All field except custom fields are displayed and are optional (default behavior, if user was created by admin or deleg)
			defaultBehavior = true;
		}

		// Init fields
		$('tr[id^="manageAccountForm_personal_settings_"][id$="_block"]').show();
		$('span[id^="manageAccountForm_personal_settings_"][id$="_state"]').css("visibility", "");
		$('#manageAccountForm_personal_settings_postal_postoffice_box_state').css("visibility", "hidden");
		$('#manageAccountForm_personal_settings_postal_state_or_province_name_state').css("visibility", "hidden");

		// Configure lastName
		if (defaultBehavior == true || (creationModeSettings.lastName != undefined && creationModeSettings.lastName.display == true) || (userSettings.lastName != undefined && userSettings.lastName.value != "")) {
			if (defaultBehavior == true || creationModeSettings.lastName == undefined || creationModeSettings.lastName.mandatory != true) {
				$('#manageAccountForm_personal_settings_last_name_state').css("visibility", "hidden");
			}
			if (userSettings.lastName != undefined && userSettings.lastName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="last_name"]').val(userSettings.lastName.value);
			}
		}
		else {
			$('#manageAccountForm_personal_settings_last_name_block').hide();
		}

		// Configure firstName
		if (defaultBehavior == true || (creationModeSettings.firstName != undefined && creationModeSettings.firstName.display == true) || (userSettings.firstName != undefined && userSettings.firstName.value != "")) {
			if (defaultBehavior == true || creationModeSettings.firstName == undefined || creationModeSettings.firstName.mandatory != true) {
				$('#manageAccountForm_personal_settings_first_name_state').css("visibility", "hidden");
			}
			if (userSettings.firstName != undefined && userSettings.firstName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="first_name"]').val(userSettings.firstName.value);
			}
		}
		else {
			$('#manageAccountForm_personal_settings_first_name_block').hide();
		}

		// Configure email
		if (defaultBehavior == true || (creationModeSettings.email != undefined && creationModeSettings.email.display == true) || (userSettings.email != undefined && userSettings.email.value != "")) {
			if (defaultBehavior == true || creationModeSettings.email == undefined || creationModeSettings.email.mandatory != true) {
				$('#manageAccountForm_personal_settings_email_state').css("visibility", "hidden");
			}
			if (userSettings.email != undefined && userSettings.email.value != undefined) {
				$('form[name="manageAccountForm"] input[name="email"]').val(userSettings.email.value);
			}
		}
		else {
			$('#manageAccountForm_personal_settings_email_block').hide();
		}

		// Configure phoneNumber
		if (defaultBehavior == true || (creationModeSettings.phone != undefined && creationModeSettings.phone.display == true) || (userSettings.phoneNumber != undefined && userSettings.phoneNumber.value != "")) {
			if (defaultBehavior == true || creationModeSettings.phone == undefined || creationModeSettings.phone.mandatory != true) {
				$('#manageAccountForm_personal_settings_phone_state').css("visibility", "hidden");
			}
			if (userSettings.phoneNumber != undefined && userSettings.phoneNumber.value != undefined) {
				if (userSettings.phoneNumber.value == "") {
					$('form[name="manageAccountForm"] input[name="prefix"]').show();
					$('#manageAccountForm_personal_settings_phone_help_link').show();
				}
				else {
					$('form[name="manageAccountForm"] input[name="phone"]').val(userSettings.phoneNumber.value);
					$('form[name="manageAccountForm"] input[name="prefix"]').hide();
					$('#manageAccountForm_personal_settings_phone_help_link').hide();
					manageAccountForm_personal_settings_changed['phone'] = true;
				}
			}
			else {
				// Display prefix field if there was no phone registered
				$('form[name="manageAccountForm"] input[name="prefix"]').show();
				$('#manageAccountForm_personal_settings_phone_help_link').show();
			}
		}
		else {
			$('#manageAccountForm_personal_settings_phone_block').hide();
		}

		// Configure organizationalUnitName
		if (defaultBehavior == true || (creationModeSettings.organizationalUnitName != undefined && creationModeSettings.organizationalUnitName.display == true) || (userSettings.organizationalUnitName != undefined && userSettings.organizationalUnitName.value != "")) {
			if (defaultBehavior == true || creationModeSettings.organizationalUnitName == undefined || creationModeSettings.organizationalUnitName.mandatory != true) {
				$('#manageAccountForm_personal_settings_organizational_unit_name_state').css("visibility", "hidden");
			}
			if (userSettings.organizationalUnitName != undefined && userSettings.organizationalUnitName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="organizational_unit_name"]').val(userSettings.organizationalUnitName.value);
			}
		}
		else {
			$('#manageAccountForm_personal_settings_organizational_unit_name_block').hide();
		}

		// Configure postal fields
		if (defaultBehavior == true || (creationModeSettings.postalAddress != undefined && creationModeSettings.postalAddress.display == true) || (userSettings.postalAddress != undefined && userSettings.postalAddress.value != "")) {
			// Configure countryName
			if (defaultBehavior == true || creationModeSettings.postalAddress == undefined || creationModeSettings.postalAddress.mandatory != true) {
				$('#manageAccountForm_personal_settings_postal_country_name_state').css("visibility", "hidden");
			}
			if (userSettings.countryName != undefined && userSettings.countryName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_country_name"]').val(userSettings.countryName.value);
			}

			// Configure localityName
			if (defaultBehavior == true || creationModeSettings.postalAddress == undefined || creationModeSettings.postalAddress.mandatory != true) {
				$('#manageAccountForm_personal_settings_postal_locality_name_state').css("visibility", "hidden");
			}
			if (userSettings.localityName != undefined && userSettings.localityName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_locality_name"]').val(userSettings.localityName.value);
			}

			// Configure postalCode
			if (defaultBehavior == true || creationModeSettings.postalAddress == undefined || creationModeSettings.postalAddress.mandatory != true) {
				$('#manageAccountForm_personal_settings_postal_code_state').css("visibility", "hidden");
			}
			if (userSettings.postalCode != undefined && userSettings.postalCode.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_code"]').val(userSettings.postalCode.value);
			}

			// Configure postalAddress
			if (defaultBehavior == true || creationModeSettings.postalAddress == undefined || creationModeSettings.postalAddress.mandatory != true) {
				$('#manageAccountForm_personal_settings_postal_address_state').css("visibility", "hidden");
			}
			if (userSettings.postalAddress != undefined && userSettings.postalAddress.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_address"]').val(userSettings.postalAddress.value);
			}

			// Configure stateOrProvinceName
			if (userSettings.stateOrProvinceName != undefined && userSettings.stateOrProvinceName.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_state_or_province_name"]').val(userSettings.stateOrProvinceName.value);
			}

			// Configure postOfficeBox
			if (userSettings.postOfficeBox != undefined && userSettings.postOfficeBox.value != undefined) {
				$('form[name="manageAccountForm"] input[name="postal_postoffice_box"]').val(userSettings.postOfficeBox.value);
			}
		}
		else {
			$('#manageAccountForm_personal_settings_postal_address_block').hide();
		}

		// Configure personal fields
		var userCustomFields = new Array();
		if (userSettings.customFields != undefined) {
			$.each(userSettings.customFields, function(index, params) {
				userCustomFields[params.fieldid] = params.value;
			});
		}
		for (var itt = 1; itt <= 3; itt++) {
			if ( defaultBehavior == false && ((creationModeSettings['personalField_' + itt] != undefined && creationModeSettings['personalField_' + itt].display == true)
				|| (userCustomFields.length > 0 && userCustomFields[itt] != undefined && userCustomFields[itt] != ""))) {
				if (creationModeSettings['personalField_' + itt] == undefined || creationModeSettings['personalField_' + itt].mandatory != true) {
					$('#manageAccountForm_personal_settings_personal_field_' + itt + '_state').css("visibility", "hidden");
				}
				manageAccountForm_personal_settings_customFields_configure(displayLang);

				if (userCustomFields[itt] != undefined) {
					$('form[name="manageAccountForm"] input[name="personal_field_' + itt + '"]').val(userCustomFields[itt]);
				}
			}
			else {
				$('#manageAccountForm_personal_settings_personal_field_' + itt + '_block').hide();
			}
		}
	}
}

function manageAccountForm_personal_settings_empty() {
	$('#manageAccountForm_personal_settings_block input[type="text"]').val('');
	$('#manageAccountForm_personal_settings_block span[id^="manageAccountForm_personal_settings_personal_field_"][id$="_text"]').text("");

	manageAccountForm_personal_settings_phoneHelpBlock_configure();
	manageAccountForm_personal_settings_changed['prefix'] = false;
	manageAccountForm_personal_settings_changed['phone'] = false;
}

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function manageAccountForm_personal_settings_modifyEvent(type, element) {
	switch (type) {
		case 'focus':
			if (manageAccountForm_personal_settings_changed[element.attr("name")] != true) {
				element.val("");
			}
			break;

		case 'blur':
			if (element.val() == "") {
				element.val(getInputTranslation(element.attr("id")));
				manageAccountForm_personal_settings_changed[element.attr("name")] = false;
			}
			else {
				manageAccountForm_personal_settings_changed[element.attr("name")] = true;
			}
			break;
	}
}

/** Display manageAccountForm_phone_help_block when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function manageAccountForm_personal_settings_phoneHelpBlock_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#manageAccountForm_personal_settings_phone_help_block').is(':hidden') == true) {
		display = true;
	}
	// Do not display phone help if the icon is hidden
	if ($('#manageAccountForm_personal_settings_phone_help_link').is(':hidden') == true) {
		display = false;
	}

	if (display == true) {
		$('#manageAccountForm_personal_settings_phone_help_block').show();
	}
	else {
		$('#manageAccountForm_personal_settings_phone_help_block').hide();
	}
}

/** Configure manageAccountForm_phone_block
 * @param string displayLang - The language whish to display the content
 */
function manageAccountForm_personal_settings_phoneHelpBlock_configure(displayLang) {
	if (manageAccountForm_personal_settings_changed['prefix'] != true) {
		$('#manageAccountForm_personal_settings_phone_prefix_value').val(getInputTranslation("manageAccountForm_personal_settings_phone_prefix_value", displayLang));
	}
	if (manageAccountForm_personal_settings_changed['phone'] != true) {
		$('#manageAccountForm_personal_settings_phone_phone_value').val(getInputTranslation("manageAccountForm_personal_settings_phone_phone_value", displayLang));
	}
	$('#manageAccountForm_personal_settings_phone_help_prefix_example_value').val(getInputTranslation("manageAccountForm_personal_settings_phone_help_prefix_example_value", displayLang));
	$('#manageAccountForm_personal_settings_phone_help_phone_example_value').val(getInputTranslation("manageAccountForm_personal_settings_phone_help_phone_example_value", displayLang));
}

function manageAccountForm_personal_settings_customFields_configure(displayLang) {

	var field_names = new Array("personalField_1", "personalField_2", "personalField_3");
	var itt = 1;
	var creationModeSettings = undefined;
	var userSettings = $.settings.user;

	if ($.settings.user.creationMode != undefined) {
		var creationModeRegExp = new RegExp("^portal-([a-zA-Z_-]+)$");
		var creationModeMatches = creationModeRegExp.exec($.settings.user.creationMode.value);
		if (creationModeMatches != undefined) {
			var creationMode = creationModeMatches[1];
			creationModeSettings = $.settings.subscribe[creationMode];
		}
	}

	var userCustomFields = new Array();
	if (userSettings.customFields != undefined) {
		$.each(userSettings.customFields, function(index, params) {
			userCustomFields[params.fieldid] = params;
		});
	}

	if (creationModeSettings != undefined) {
		for (key in field_names) {
			var field_name = field_names[key];
			var labels = undefined;
			if (creationModeSettings[field_name] != undefined) {
				labels = creationModeSettings[field_name].labels;
			}
			else if (userCustomFields[itt] != undefined) {
				labels = userCustomFields[itt].label;
			}
			if (labels != undefined) {
				if (labels[displayLang] != undefined) {
					$("#manageAccountForm_personal_settings_personal_field_" + itt + "_text").html(labels[displayLang]);
				}
				else if (labels[$.settings.lang.defaultLang] != undefined) {
					$("#manageAccountForm_personal_settings_personal_field_" + itt + "_text").html(labels[$.settings.lang.defaultLang]);
				}
				else {
					$("#manageAccountForm_personal_settings_personal_field_" + itt + "_text").html(labels[$.settings.lang.customFieldsDefaultLang]);
				}
			}
			itt++;
		}
	}
}


function manageAccountForm_devices_fillIn() {
	$('#manageAccountForm_devices_no_device_block').show();
	if ($.settings.user != undefined && $.settings.user.devices != undefined && $.settings.user.manageDevices == true )
	{
		var userDevices = $.settings.user.devices;
		if (userDevices.length != 0)
		{
			$('#manageAccountForm_devices_no_device_block').hide();
			$.each(userDevices, function(deviceIndex, deviceValues) {
				if (deviceValues.address != undefined) {
					var clone = $('#manageAccountForm_devices_base_block').clone().show();
					$(clone).attr("id", $(clone).attr("id").replace("_base", "_" + deviceIndex));
					$(clone).find('span').each(function() {
						$(this).attr("id", $(this).attr("id").replace("_base", "_" + deviceIndex));
						$(this).text(deviceValues.address);
					});
					$(clone).find('input').each(function() {
						$(this).attr("name", $(this).attr("name").replace("_base", "_" + deviceIndex));
						$(this).val(deviceValues.comment);
						if (deviceValues.locked == true) {
							$(this).attr('disabled', 'disabled');
						}
					});
					if (deviceValues.current == true) {
						$(clone).addClass('currentDevice');
					}
					if (deviceValues.locked == true) {
						$(clone).find('div.trashButton').remove();
					}
					$(clone).insertBefore($('#manageAccountForm_devices_base_block'));
				}
			});
		}
	}
}

function manageAccountForm_devices_empty() {
	$('#manageAccountForm_devices_no_device_block').show();
	$('#manageAccountForm_devices_block tr[id^="manageAccountForm_devices_"][id$="_block"][id!="manageAccountForm_devices_base_block"][id!="manageAccountForm_devices_no_device_block"]').remove();
}

function manageAccountForm_devices_delete() {
	$(this).parents('tr[id^="manageAccountForm_devices_"][id$="_block"]').remove();
}

/** Enable waiting mode on manageAccountForm
 */
function manageAccountFormWaiting(state) {
	switch (state) {
		case true:
			$('form[name="manageAccountForm"] button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="manageAccountForm"] button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when manageAccountForm_personal_settings_update_button button is clicked
 */
function manageAccountForm_personal_settings_update() {

	var params = new Object();
	params.lastName = $('form[name="manageAccountForm"] input[name="last_name"]').val();
	params.firstName = $('form[name="manageAccountForm"] input[name="first_name"]').val();
	params.emailAddress = $('form[name="manageAccountForm"] input[name="email"]').val();

	params.organizationalUnitName = $('form[name="manageAccountForm"] input[name="organizational_unit_name"]').val();

	params.postalAddress = $('form[name="manageAccountForm"] input[name="postal_address"]').val();
	params.postalCode = $('form[name="manageAccountForm"] input[name="postal_code"]').val();
	params.postalLocalityName = $('form[name="manageAccountForm"] input[name="postal_locality_name"]').val();
	params.postalPostofficeBox = $('form[name="manageAccountForm"] input[name="postal_postoffice_box"]').val();
	params.postalStateOrProvinceName = $('form[name="manageAccountForm"] input[name="postal_state_or_province_name"]').val();
	params.postalCountryName = $('form[name="manageAccountForm"] input[name="postal_country_name"]').val();

	params.prefix = (manageAccountForm_personal_settings_changed['prefix'] == true) ? $('form[name="manageAccountForm"] input[name="prefix"]').val() : "";
	params.phone = (manageAccountForm_personal_settings_changed['phone'] == true) ? $('form[name="manageAccountForm"] input[name="phone"]').val() : "";

	// Custom fields
	params.personalField_1 = $('form[name="manageAccountForm"] input[name="personal_field_1"]').val();
	params.personalField_2 = $('form[name="manageAccountForm"] input[name="personal_field_2"]').val();
	params.personalField_3 = $('form[name="manageAccountForm"] input[name="personal_field_3"]').val();

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { manageAccountFormWaiting(true); };
	callbacks.success    = function() { manageAccountForm_personal_settings_updateCallback(); };
	callbacks.complete   = function() { manageAccountFormWaiting(false); };

	updatePersonalSettings(callbacks, params);
}

/** Executed on return of manageAccountForm_personal_settings_update function
 */
function manageAccountForm_personal_settings_updateCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		manageAccountForm_display(true);
	}
}

function manageAccountForm_devices_update() {
	var params = new Object();

	$('form[name="manageAccountForm"] input[name^="device_"]').each(function() {
		params[$(this).attr("name")] = $(this).val();
	});

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { manageAccountFormWaiting(true); };
	callbacks.success    = function() { manageAccountForm_personal_settings_updateCallback(); };
	callbacks.complete   = function() { manageAccountFormWaiting(false); };

	updateDevicesSettings(callbacks, params);
}

/** Executed on return of manageAccountForm_devices_update function
 */
function manageAccountForm_personal_settings_updateCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		manageAccountForm_display(true);
	}
}


/*****************************************************************************/
/****          Modify package Form JavaScript functions                   ****/
/*****************************************************************************/


/** Enable waiting mode
 */
function modifyPackageForm_cancel_button_show_hide(state) {
	switch (state) {
		case true:
			$('form[name="modifyPackageForm"] button').hide();
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="modifyPackageForm"] button').show();
			$('body').toggleClass("cursor-wait");
			break;
	}
}


function modifyPackageForm_package_update (){
	var params = new Object();


	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { modifyPackageForm_cancel_button_show_hide(true);};
	callbacks.success    = function() { modifyPackageFormCallback();};
	callbacks.complete   = function() { modifyPackageForm_cancel_button_show_hide(false);};

	$.settings.step = "PAYMENT";
	$.settings.type = "PMS";
	switch_package = true;
	pmsPaymentForm_display(true);
	manageAccountForm_display(false);

}

/** Executed on return of modifyPackageForm function
 */
function modifyPackageFormCallback() {
	switch_package = false;
	displayErrorInfo();
	if ($.settings.error == undefined) {
		modifyPackageForm_display(true);
	}
}


/*****************************************************************************/
/****           Account refill Form JavaScript functions                  ****/
/*****************************************************************************/

/** Listen to modified element
 */
var accountRefillForm_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
	$('form[name="accountRefillForm"] select[name="select_package"]').change(function() {
		accountRefillForm_options_describe();
		accountRefillFormPay();
	});
	$('form[name="accountRefillForm"] select[name="select_package"]').keyup(function() {
		accountRefillForm_options_describe();
		accountRefillFormPay();
	});

	/** Form triggers
	 */
	$('form[name="accountRefillForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#logonForm_accountRefillLink_link').click(function() {
		accountRefillForm_options_configure();
		accountRefillForm_display(true);
		logonForm_display(false);
	});

	$('#paypalRefillLink').click(function() {
		accountRefillPaymentSubscribe('paypal');
	});

	$('#ogoneRefillLink').click(function() {
		accountRefillPaymentSubscribe('ogone');
	});

	/** Buttons triggers
	 */
	$('#accountRefillForm_back_button').click(function() {
		if ( $.settings.user != undefined && $.settings.user.login != undefined ) {
			manageAccountForm_display(true);
		}
		else {
			logonForm_display(true);
		}
		accountRefillForm_display(false);
		resetPaymentProcess();
	});

	$('#accountRefillForm_pay_button').click(function() {
		accountRefillFormPay();
	});

	$('#accountRefillForm_confirm_button').click(function() {
		if ($.settings.payment != undefined && $.settings.payment.type != undefined && $.settings.payment.type != 'free') {
			// Payed option
			accountRefillForm_confirm();
		}
		else {
			// Free option 2 possibilities
			if ($('form[name="accountRefillForm"] select[name="select_package"]').val() == "") {
				// manual written of code in dedicated field
				accountRefillForm_confirm();
			}
			else {
				// Automatic refill with the selected option in portal
				accountRefillForm_get_free_refill_code();
			}
		}
	});
});


function resetPaymentProcess() {

	var callbacks = new Object();
	callbacks.beforeSend = function() { accountRefillFormWaiting(true); };
	callbacks.success    = function() { accountRefillFormResetPayment_confirmCallback(this); };
	callbacks.complete   = function() { accountRefillFormWaiting(false); };

	backAction(callbacks);
}

function accountRefillFormResetPayment_confirmCallback() {
	displayErrorInfo();
}

function accountRefillForm_paymentValidate() {

	// Configure display
	if ($.settings.payment != undefined && $.settings.payment.login != undefined && $.settings.payment.code != undefined) {

		$('form[name="accountRefillForm"] input[name="login"]').val($.settings.payment.login);
		$('form[name="accountRefillForm"] input[name="refillcode"]').val($.settings.payment.code);
		if ($.settings.accountRefill == true) {
			$('form[name="accountRefillForm"]').show();
			$('#accountRefillForm_confirm_button').show();
			$('#accountRefillForm_table').hide();
			$('#accountRefillForm_explain').hide();
		}
	}
}

/** Configure accountRefillForm depending on settings
 */

function accountRefillForm_configure() {

	// Configure display
	if ($.settings.accountRefill == true) {
		$('#logonForm_accountRefillLink').show();
		accountRefillForm_options_configure();
	}
	else {
		$('form[name="accountRefillForm"]').remove();
	}
}

function accountRefillForm_options_configure(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.options != undefined) {
		var optionsInfos = null;
		var defaultOptionText;

		if ($.settings.subscribe.options.refill != undefined) {
			var optionsInfos = $.settings.subscribe.options.refill;
			defaultOptionText = getTextTranslation('paypalOptionPaymentForm_default_package_option');
			$('#accountRefillForm_select_option_text').text(getTextTranslation('accountRefillForm_select_option_text'));
			$('#accountRefillForm_title_text').text(getTextTranslation('accountRefillForm_title_text'));
			$('#accountRefillForm_explain_text').text(getTextTranslation('accountRefillForm_explain_text'));
			$('#accountRefillForm_option_description_explain').text(getTextTranslation('accountRefillForm_option_description_explain'));
			$('#accountRefillForm_option_description_text').text(getTextTranslation('accountRefillForm_option_description_text'));
		}
		else {
			return;
		}

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}

		// Empty the select list
		$('form[name="accountRefillForm"] select[name="select_package"]').empty();
		$('form[name="accountRefillForm"] select[name="select_package"]').append('<option id="accountRefillForm_default_option" disabled selected value="">' + defaultOptionText + '</option>');
		// Populate list
		$(optionsInfos).each(function () {
			var package = $(this)[0];
			var text;
			var currencyLanguage;
			if (package[displayLang] != undefined) {
				text = package[displayLang].text;
				currencyLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
			}
			else if (package[package.defaultLang] != undefined) {
				text = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
			}
			else {
				text = "";
				currencyLanguage = package.defaultLang;
			}

			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}

			var disabled = ' ';

			$('form[name="accountRefillForm"] select[name="select_package"]').append('<option value="' + package.name + '"' + disabled + '>' + text + '</option>');
		});
	}
}

/** Display accountRefillForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function accountRefillForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if (display == true) {
		// Fill in logon fields
		if ( $.settings.user != undefined && $.settings.user.login != undefined ) {
			$('form[name="accountRefillForm"] input[name="login"]').val($.settings.user.login.value);
		}

		$('form[name="accountRefillForm"]').show();
		$('#accountRefillForm_table').show();
		if ($.settings.subscribe != undefined && $.settings.subscribe.options != undefined && $.settings.subscribe.options.refill != undefined) {
			$('#accountRefillForm_option_user_explain').show();
			$('#accountRefillForm_table').show();
		}
		else {
			$('#accountRefillForm_option_user_explain').hide();
			$('#accountRefillForm_table').hide();
		}
	}
	else {
		$('form[name="accountRefillForm"]').hide();
		$('#paypalRefillLink').hide();
		$('#ogoneRefillLink').hide();
	}
}

function accountRefillPaymentSubscribe(type) {
	var params = new Object();

	params.login    = $('form[name = "accountRefillForm"] input[name = "login"]').val();
	params.type     = type;
	params.password = $('form[name = "accountRefillForm"] input[name = "password"]').val();
	params.package  = $('form[name = "accountRefillForm"] select[name = "select_package"]').val();

	var callbacks = new Object();
	callbacks.beforeSend = function() { accountRefillFormWaiting(true); };
	callbacks.success    = function() { accountRefillFormPaymentSubscribe_confirmCallback(this); };
	callbacks.complete   = function() { accountRefillFormWaiting(false); };

	refillAccountPaymentSubscribe(callbacks, params);
}

function accountRefillForm_confirm() {
	var params = new Object();

	params.login      = $('form[name = "accountRefillForm"] input[name = "login"]').val();
	params.refillCode = $('form[name = "accountRefillForm"] input[name = "refillcode"]').val();
	params.password   = $('form[name = "accountRefillForm"] input[name = "password"]').val();

	if ($.settings.payment && $.settings.payment.process) {
		params.process = $.settings.payment.process;

		// Particular case of free refill, code value is retrieved in settings parameters.
		if ($.settings.payment.process == "refill" && $.settings.payment.type == "free") {
			params.refillCode = $.settings.payment.code;
		}
	}
	//Re-init settings to get up to date infos, caused by $.extend use, merging returned ajax data
	clearUserSettings();

	// Re-init payment settings to be able to restart from a virgin  state
	clearPaymentSettings();

	var callbacks = new Object();
	callbacks.beforeSend = function() { accountRefillFormWaiting(true); };
	callbacks.success    = function() { accountRefillForm_confirmCallback(); };
	callbacks.complete   = function() { accountRefillFormWaiting(false); };

	refillAccount(callbacks, params);
}

function accountRefillForm_get_free_refill_code() {
	var params = new Object();

	params.login    = $('form[name = "accountRefillForm"] input[name  = "login"]').val();
	params.package  = $('form[name = "accountRefillForm"] select[name = "select_package"]').val();
	params.password = $('form[name = "accountRefillForm"] input[name  = "password"]').val();

	var callbacks = new Object();
	callbacks.beforeSend = function() { accountRefillFormWaiting(true); };
	callbacks.success    = function() { accountRefillForm_confirm(); };
	callbacks.complete   = function() { accountRefillFormWaiting(false); };

	getFreeRefillCode(callbacks, params);
}

function accountRefillFormPaymentSubscribe_confirmCallback() {

	if ($.settings.error == undefined) {
		if ( $.settings.user != undefined && $.settings.user.login != undefined ) {
			manageAccountForm_display(false);

			if ($.settings.type == 'PAYPAL') {
				paypalPaymentForm_options_describe();
				paypalPaymentForm_display(true);
			}
			else if ($.settings.type == 'OGONE') {
				ogonePaymentForm_options_describe();
				ogonePaymentForm_display(true);
			}
		}
		else {
			logonForm_display(true);
		}

		resetErrorInfo();

		accountRefillForm_display(false);
	}
	else {
		displayErrorInfo();
	}
}

/** Executed on return of accountRefillForm_update function
 */
function accountRefillForm_confirmCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ( $.settings.user != undefined && $.settings.user.login != undefined ) {
			manageAccountForm_display(false);
			feedbackForm_display(true);
		}
		else {
			logonForm_display(true);
		}
		accountRefillForm_display(false);
	}
}

/** Enable waiting mode on accountRefillSetForm
 */
function accountRefillFormWaiting(state) {
	switch (state) {
		case true:
			$('form[name="accountRefillForm"] button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('form[name="accountRefillForm"] button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when pay button is clicked
 */
function accountRefillFormPay() {

	var optionInfos = null;

	if ($.settings.subscribe != undefined && $.settings.subscribe.options != undefined) {

		if ($.settings.subscribe.options.refill != undefined) {
			for (var i = 0; i < $.settings.subscribe.options.refill.length; i++) {
				if ($.settings.subscribe.options.refill[i].name == $('form[name="accountRefillForm"] select[name="select_package"]').val()) {
					optionInfos = $.settings.subscribe.options.refill[i];
					break;
				}
			}

			if (optionInfos.price != 0) {
				if ($.settings.subscribe.paypal && $.settings.subscribe.paypal.refill) {
					$('#paypalRefillLink').appendTo('#refillForm_subscriptionChoice_grid').show();
				}

				if ($.settings.subscribe.ogone && $.settings.subscribe.ogone.refill) {
					$('#ogoneRefillLink').appendTo('#refillForm_subscriptionChoice_grid').show();
				}

				$('#accountRefillForm_confirm_button').hide();
			}
			else {
				$('#paypalRefillLink').hide();
				$('#ogoneRefillLink').hide();

				$('#accountRefillForm_confirm_button').show();
			}
		}

		// accountRefillForm_free_refill_line must be always displayed to allow user to enter refill code manually
		$('#accountRefillForm_behavior_explain').show();
		$('form[name = "accountRefillForm"] input[name  = "refillcode"]').attr("disabled", true);
	}
	else {
		$('#accountRefillForm_behavior_explain').hide();
		$('form[name = "accountRefillForm"] input[name  = "refillcode"]').attr("disabled", false);
		$('#accountRefillForm_confirm_button').show();
	}
}

function accountRefillForm_options_describe(displayLang) {
	if ($.settings.subscribe != undefined && $.settings.subscribe.options != undefined) {

		var optionsInfos = null;
		if ($.settings.subscribe.options.refill != undefined) {
			var optionsInfos = $.settings.subscribe.options.refill;
		}
		else {
			return;
		}

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		// Update describe block
		if ($('form[name="accountRefillForm"] select[name="select_package"]').val() == "") {
			$('#accountRefillForm_option_description_explain').show();
			$('#accountRefillForm_option_description_value').html("");
		}
		else {
			$(optionsInfos).each(function () {
				var package = $(this)[0];
				if (package.name == $('form[name="accountRefillForm"] select[name="select_package"]').val()) {
					var describe;
					if (package[displayLang] != undefined) {
						describe = package[displayLang].description;
					}
					else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
						describe = package[$.settings.lang.defaultLang].description;
					}
					else if (package[package.defaultLang] != undefined) {
						describe = package[package.defaultLang].description;
					}

					if (describe == undefined) {
						describe = getTextTranslation('accountRefillForm_no_description');
					}

					$('#accountRefillForm_option_description_explain').hide();
					$('#accountRefillForm_option_description_value').html(describe);
				}
			});
		}
	}
}


/*****************************************************************************/
/****                    Auto Form JavaScript functions                   ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {
	
	/** Buttons triggers
	 */
	$('#autoLogonForm_connect_button').click(function() {
		autoLogonFormConnect();
	});
	
	/** Form triggers
	 */
	$('form[name="autoLogonForm"]').submit(function() {
		return false;
	});
});

/**
 * Configure autoLogonForm depending on settings
 */
function autoLogonForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.auto != undefined) {
	
		// Configure policy display
		if ($.settings.logon != undefined && $.settings.logon.policy != undefined && $.settings.logon.policy.display == true) {
			autoLogonForm_policy_configure();
		}
		else {
			// Modify event on securePwdForm 
			$('form[name="securePwdForm"]').unbind();
			$('form[name="securePwdForm"]').submit(function() {
				autoLogonWithSecurePasswordConnect(); return false;
			});
			
			$('#autoLogonForm_policy_block').remove();
		}
	}
	else {
		$('form[name="autoLogonForm"]').remove();
	}
}

/** Configure autoLogonForm_policy_block
 * @param string lang - The language whish to display the policy
 */
function autoLogonForm_policy_configure(lang) {
	
	if ($.settings.logon != undefined && $.settings.logon.policy != undefined) {
		var policy = extractPolicyText($.settings.logon, lang);
		$('#autoLogonForm_policy_text').html(policy);
	}
}

/** Display autoLogonForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function autoLogonForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "SUBSCRIBE") && ($.settings.type != undefined && $.settings.type == "AUTO") ) {
		display = true;
	}
	
	if (display == true) {
		$('form[name="autoLogonForm"]').show();
	}
	else {
		$('form[name="autoLogonForm"]').hide();
	}
}

/** Enable waiting mode on autoLogonForm
 */
function autoLogonFormWaiting(state) {
	switch (state) {
		case true:
			$('#autoLogonForm_connect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#autoLogonForm_connect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when connect button is clicked
 */
function autoLogonFormConnect() {

	var params = new Object();
	params.policyAccept = $('form[name="autoLogonForm"] input[name="policy_accept"]').is(':checked');
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { autoLogonFormWaiting(true); };
	callbacks.success    = function() { autoLogonFormConnectCallback(); };
	callbacks.complete   = function() { autoLogonFormWaiting(false); };
		
	autoAuthenticate(callbacks, params);
}

/** Executed on return of autoLogonFormConnect function
 */
function autoLogonFormConnectCallback() {

	if ($.settings.error == undefined) {
		// Redirect user to forced web page or requested web page
		window.location = $.settings.info.subscribe.autoUrl;
	}
	else {
		displayErrorInfo();
		displayStep();
	}
}

/** Executed on click on securePwdForm_access_button when secure password is required and no policy
 * Is from copy of securePwdFormAccess function
 */
function autoLogonWithSecurePasswordConnect() {

	var params = new Object();
	// Mandatory parameters
	params.securePwd = $('form[name="securePwdForm"] input[name="secure_pwd"]').val();
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { autoLogonFormWaiting(true); };
	callbacks.success    = function() { autoLogonWithSecurePasswordConnectCallback(); };
	callbacks.complete   = function() { autoLogonFormWaiting(false); };
	
	securePwd(callbacks, params);
}

/** Executed on return of autoLogonWithSecurePasswordConnect function
 * Is from copy of securePwdFormAccessCallback function
 */
function autoLogonWithSecurePasswordConnectCallback() {
	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.user == undefined) {
			$.settings.user = new Object();
		}
		if ($.settings.user.securePwd == undefined) {
			$.settings.user.securePwd = new Object();
		}
		$.settings.user.securePwd.value = $('form[name="securePwdForm"] input[name="secure_pwd"]').val();
		autoLogonFormConnect();
	}
}

/*****************************************************************************/
/****            One Subscription Form JavaScript functions            ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
        var other_choices = null;
        if($('#oneSubscriptionForm_other_choices_button').length == 1) {
            other_choices = $('#oneSubscriptionForm_other_choices_button');
        }
        else {
            other_choices = $('#oneSubscriptionForm_other_choices_link');
        }
        if(other_choices != null) {
            other_choices.click(function() {
		oneSubscriptionFormOtherChoices();
            });
        }

	$('#oneSubscriptionForm_connect_button').click(function() {
		oneSubscriptionFormConnect();
	});

	/** Form triggers
	 */
	$('form[name="oneSubscriptionForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#oneSubscriptionLink').click(function() {
		oneSubscriptionLinkEnable();
	});
});

/** Configure oneSubscriptionForm depending on settings
 */
function oneSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.one != undefined) {
	    // Moving link to right location
	    if($('#logonForm_subscriptionChoice_grid').length == 1) {
		$('#oneSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
	    }
	    else {
		if ($.settings.subscribe.count > 1) {
			$('#oneSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
		}
		else if ($.settings.subscribe.count == 1) {
			$('#logonFormSubscriptionLink_link').click(function() {
				oneSubscriptionLinkEnable();
			});
		}
	    }

		// Configure connect policy
		if ($.settings.logon != undefined && $.settings.logon.policy != undefined && $.settings.logon.policy.display == true) {
			oneSubscriptionForm_connect_policy_configure();
		}
		else {
			$('#oneSubscriptionForm_connect_policy_block').remove();
		}

		// Configure other choices link
		if ($.settings.auth_modes == undefined || ($.settings.auth_modes.one == true && Object.keys($.settings.auth_modes).length == 1)) {
			if($('#oneSubscriptionForm_other_choices_block').length == 1) {
				$('#oneSubscriptionForm_other_choices_block').remove();
			}
			else {
				$('#oneSubscriptionForm_other_choices_link').remove();
			}
		}
		subscriptionForm_configure('one');
	}
	else {
		$('form[name="oneSubscriptionForm"]').remove();
		$('#oneSubscriptionLink').remove();
	}
}

/** Configure oneSubscriptionForm_connect_policy_block
 * @param string displayLang - The language whish to display the policy
 */
function oneSubscriptionForm_connect_policy_configure(displayLang) {

	if ($.settings.logon != undefined && $.settings.logon.policy != undefined) {
		var policy = extractPolicyText($.settings.logon, displayLang);
		$('#oneSubscriptionForm_connect_policy_text').html(policy);
	}
}

/** Display oneSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function oneSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "SUBSCRIBE" && $.settings.type == "ONE") && ( (typeof informativeWidget_configure != 'function') || ($.settings.informativeWidget == undefined) ) ) {
		display = true;
	}
	if (display == true) {
	    	subscriptionForm_commonFields_display('one');
		$('form[name="oneSubscriptionForm"]').show();
	}
	else {
		$('form[name="oneSubscriptionForm"]').hide();
		subscriptionForm_empty('one');
	}
	subscriptionForm_phoneHelpBlock_display(false);
	subscriptionForm_passwordHelpBlock_display(false);
}

/** Executed when other choices link is clicked
 */
function oneSubscriptionFormOtherChoices() {
    var callbacks = new Object();
    // callbacks.beforeSend = function() {}; // TODO
    callbacks.success    = function() { displayStep(); };
    // callbacks.complete   = function() {}; // TODO
    backAction(callbacks);
}

/** Enable waiting mode on oneSubscriptionForm
 */
function oneSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#oneSubscriptionForm_other_choices_button').attr("disabled", true);
			$('#oneSubscriptionForm_connect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#oneSubscriptionForm_other_choices_button').attr("disabled", false);
			$('#oneSubscriptionForm_connect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when connect button is clicked
 */
function oneSubscriptionFormConnect() {
    var params = subscriptionFormSubscribe('one');
    // Connect policy
    params.connectPolicyAccept = $('form[name="oneSubscriptionForm"] input[name="connect_policy_accept"]').is(':checked');
    var callbacks = new Object();
    callbacks.beforeSend = function() { oneSubscriptionFormWaiting(true); };
    callbacks.success    = function() { oneSubscriptionFormConnectCallback(); };
    callbacks.complete   = function() { oneSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of oneSubscriptionFormConnect function
 */
function oneSubscriptionFormConnectCallback() {

	if ($.settings.error == undefined) {
		// Remember form values before trying to connect, to avoid multiple creation of a same account
		$('form[name="logonForm"] input[name="login"]').val($.settings.info.subscribe.login);
		$('form[name="logonForm"] input[name="password"]').val($.settings.info.subscribe.password);
		$('form[name="logonForm"] input[name="policy_accept"]').attr('checked', $('form[name="oneSubscriptionForm"] input[name="connect_policy_accept"]').is(':checked'));
		logonFormConnect();
	}
	else {
		displayErrorInfo();
	}
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function oneSubscriptionLinkEnable() {

	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { displayStep(); };
	// callbacks.complete   = function() {}; // TODO

	backAction(callbacks);
}

/*****************************************************************************/

/*****************************************************************************/
/****            Direct Subscription Form JavaScript functions            ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
	$('#directSubscriptionForm_back_button').click(function() {
		directSubscriptionFormBack();
	});

	$('#directSubscriptionForm_subscribe_button').click(function() {
		directSubscriptionFormSubscribe();
	});

	$('#directSubscriptionResultForm_back_button').click(function() {
		displayStep();
	});

	/** Form triggers
	 */
	$('form[name="directSubscriptionForm"]').submit(function() {
		return false;
	});

	$('form[name="directSubscriptionResultForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#directSubscriptionLink').click(function() {
		directSubscriptionLinkEnable();
	});
});

/** Configure subscriptionForm depending on settings
 */
function directSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.direct != undefined) {
	    // Moving link to right location
	    if($('#logonForm_subscriptionChoice_grid').length == 1) {
		$('#directSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
	    }
	    else {
		if ($.settings.subscribe.count > 1) {
			$('#directSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
		}
		else if ($.settings.subscribe.count == 1) {
			$('#logonFormSubscriptionLink_link').click(function() {
				directSubscriptionLinkEnable();
			});
		}
	    }
	    subscriptionForm_configure('direct');
	}
	else {
		$('form[name="directSubscriptionForm"]').remove();
		$('#directSubscriptionLink').remove();
	}

	// Configure directSubscriptionResultForm
	directSubscriptionResultForm_configure();
}

/** Display subscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function directSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
	    	subscriptionForm_commonFields_display('direct');
		$('form[name="directSubscriptionForm"]').show();
		$('form[name="directSubscriptionResultForm"]').hide();
	}
	else {
		$('form[name="directSubscriptionForm"]').hide();
		$('form[name="directSubscriptionResultForm"]').hide();
		subscriptionForm_empty('direct');
	}
	subscriptionForm_phoneHelpBlock_display(false);
	subscriptionForm_passwordHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function directSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on subscriptionForm
 */
function directSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#directSubscriptionForm_back_button').attr("disabled", true);
			$('#directSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#directSubscriptionForm_back_button').attr("disabled", false);
			$('#directSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function directSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('direct');
    var callbacks = new Object();
    callbacks.beforeSend = function() { directSubscriptionFormWaiting(true); };
    callbacks.success    = function() { directSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { directSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of subscriptionFormSubscribe function
 */
function directSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
	directSubscriptionResultForm_display(true);
    }
}

/** Configure directSubscriptionResultForm depending on settings
 */
function directSubscriptionResultForm_configure() {

	if ($.settings.subscribe != undefined && $.settings.subscribe.direct != undefined) {
		if ($.settings.subscribe.direct.dpsk != undefined && $.settings.subscribe.direct.dpsk.available == true) {
			if ($.settings.subscribe.direct.dpsk.wlan == undefined || $.settings.subscribe.direct.dpsk.wlan.display != true) {
				$('#directSubscriptionResultForm_dpsk_wlan_block').remove();
			}
			if ($.settings.subscribe.direct.dpsk.passphrase == undefined || $.settings.subscribe.direct.dpsk.passphrase.display != true) {
				$('#directSubscriptionResultForm_dpsk_passphrase_block').remove();
				$('#directSubscriptionResultForm_dpsk_explain_text').remove();
			}
			if ($.settings.subscribe.direct.dpsk.downloadLink == undefined || $.settings.subscribe.direct.dpsk.downloadLink.display != true) {
				$('#directSubscriptionResultForm_dpsk_download_link_block').remove();
				$('#directSubscriptionResultForm_dpsk_download_explain_text').remove();
			}
		}
		else {
			$('#directSubscriptionResultForm_dpsk_title_block').remove();
			$('#directSubscriptionResultForm_dpsk_explain_block').remove();
			$('#directSubscriptionResultForm_dpsk_wlan_block').remove();
			$('#directSubscriptionResultForm_dpsk_passphrase_block').remove();
			$('#directSubscriptionResultForm_dpsk_download_link_block').remove();
		}
	}
	else {
		$('form[name="directSubscriptionResultForm"]').remove();
	}
}

/** Display directSubscriptionResultForm (Usualy Triggered when subscribtion succeed)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function directSubscriptionResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if ($.settings.info != undefined && $.settings.info.subscribe != undefined) {
		if ($.settings.info.subscribe.login != undefined) {
			$('#directSubscriptionResultForm_login_value').html($.settings.info.subscribe.login);
		}
		if ($.settings.info.subscribe.password != undefined) {
			var tmp_input_params = subscriptionFormSubscribe('direct');
			if ($.settings.subscribe != undefined && $.settings.subscribe.direct != undefined
					&& $.settings.subscribe.direct.userPassword != undefined && $.settings.subscribe.direct.userPassword.display == true
					&& tmp_input_params.password != '') {
				// We hide the given password
				$('#directSubscriptionResultForm_password_value').html('********');
			}
			else {
				$('#directSubscriptionResultForm_password_value').html($.settings.info.subscribe.password);
			}
		}
		// Fill in logon fields
		if ($.settings.subscribe.direct.hidePortalCredentials == undefined || $.settings.subscribe.direct.hidePortalCredentials == false) {
			$('form[name="logonForm"] input[name="login"]').val($.settings.info.subscribe.login);
			$('form[name="logonForm"] input[name="password"]').val($.settings.info.subscribe.password);
		}

		if ($.settings.info.subscribe.dpsk != undefined) {
			$('#directSubscriptionResultForm_dpsk_wlan_value').html($.settings.info.subscribe.dpsk.wlan);
			if ($.settings.info.subscribe.dpsk.passphrase != undefined) {
				$('#directSubscriptionResultForm_dpsk_passphrase_value').html($.settings.info.subscribe.dpsk.passphrase);
			}
			if ($.settings.info.subscribe.dpsk.downloadURL != undefined) {
				$('#directSubscription_dpsk_download_link').attr("href", $.settings.info.subscribe.dpsk.downloadURL);
			}
		}
	}

	if ($.settings.subscribe.direct.hidePortalCredentials == undefined || $.settings.subscribe.direct.hidePortalCredentials == false) {
		if (display == true) {
			$('form[name="directSubscriptionResultForm"]').show();
			$('form[name="directSubscriptionForm"]').hide();
		}
		else {
			$('form[name="directSubscriptionForm"]').show();
			$('form[name="directSubscriptionResultForm"]').hide();
			directSubscriptionResultForm_empty();
		}
	} else {
		displayStep();
	}
}

/** Empty directSubscriptionResultForm
 */
function directSubscriptionResultForm_empty() {
	$('#directSubscriptionResultForm_login_value').html('');
	$('#directSubscriptionResultForm_password_value').html('');
	$('#directSubscriptionResultForm_dpsk_wlan_value').html('');
	$('#directSubscriptionResultForm_dpsk_passphrase_value').html('');
	$('#directSubscription_dpsk_download_link').attr("href", "#");
}
/*****************************************************************************/

/** Executed when link is clicked
 */
function directSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	directSubscriptionForm_display(true);
}

/*****************************************************************************/

/*****************************************************************************/
/****            Print Subscription Form JavaScript functions            ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
	$('#printSubscriptionForm_back_button').click(function() {
		printSubscriptionFormBack();
	});
	
	$('#printSubscriptionForm_subscribe_button').click(function() {
		printSubscriptionFormSubscribe();
	});
	
	$('#printSubscriptionResultForm_back_button').click(function() {
		displayStep();
	});
	
	/** Form triggers
	 */
	$('form[name="printSubscriptionForm"]').submit(function() {
		return false;
	});
	
	$('form[name="printSubscriptionResultForm"]').submit(function() {
		return false;
	});
	
	/** Link triggers
	 */
	$('#printSubscriptionLink').click(function() {
		printSubscriptionLinkEnable();
	});
});

/** Configure printSubscriptionForm depending on settings
 */
function printSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.print != undefined) {
	    // Moving link to right location
	    if($('#logonForm_subscriptionChoice_grid').length == 1) {
		$('#printSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
	    }
	    else {
		if ($.settings.subscribe.count > 1) {
			$('#printSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
		}
		else if ($.settings.subscribe.count == 1) {
			$('#logonFormSubscriptionLink_link').click(function() {
				printSubscriptionLinkEnable();
			});
		}
	    }
	    subscriptionForm_configure('print');
	}
	else {
		$('form[name="printSubscriptionForm"]').remove();
		$('form[name="printSubscriptionResultForm"]').remove();
		$('#printSubscriptionLink').remove();
	}
}

/** Display printSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function printSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
	    	subscriptionForm_commonFields_display('print');
		$('form[name="printSubscriptionForm"]').show();
		$('form[name="printSubscriptionResultForm"]').hide();
	}
	else {
		$('form[name="printSubscriptionForm"]').hide();
		$('form[name="printSubscriptionResultForm"]').hide();
		subscriptionForm_empty('print');
	}
	subscriptionForm_phoneHelpBlock_display(false);
	subscriptionForm_passwordHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function printSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on printSubscriptionForm
 */
function printSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#printSubscriptionForm_back_button').attr("disabled", true);
			$('#printSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#printSubscriptionForm_back_button').attr("disabled", false);
			$('#printSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function printSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('print');
    var callbacks = new Object();
    callbacks.beforeSend = function() { printSubscriptionFormWaiting(true); };
    callbacks.success    = function() { printSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { printSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of printSubscriptionFormSubscribe function
 */
function printSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
	printSubscriptionResultForm_display(true);
    }
}

/** Display printSubscriptionResultForm (Usualy Triggered when subscribtion succeed)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function printSubscriptionResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	
	if (display == true) {
		$('form[name="printSubscriptionResultForm"]').show();
		$('form[name="printSubscriptionForm"]').hide();
	}
	else {
		$('form[name="printSubscriptionForm"]').show();
		$('form[name="printSubscriptionResultForm"]').hide();
	}
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function printSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	printSubscriptionForm_display(true);
	
}

/*****************************************************************************/

/*****************************************************************************/
/****              SMS Subscription Form JavaScript functions             ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
	$('#smsSubscriptionForm_back_button').click(function() {
		smsSubscriptionFormBack();
	});
	
	$('#smsSubscriptionForm_subscribe_button').click(function() {
		smsSubscriptionFormSubscribe();
	});
	
	/** Form triggers
	 */
	$('form[name="smsSubscriptionForm"]').submit(function() {
		return false;
	});
	
	/** Link triggers
	 */
	$('#smsSubscriptionLink').click(function() {
		smsSubscriptionLinkEnable();
	});
});

/** Configure smsSubscriptionForm depending on settings
 */
function smsSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.sms != undefined) {
	    // Moving link to right location
	    if($('#logonForm_subscriptionChoice_grid').length == 1) {
		$('#smsSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
	    }
	    else {
		if ($.settings.subscribe.count > 1) {
			$('#smsSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
		}
		else if ($.settings.subscribe.count == 1) {
			$('#logonFormSubscriptionLink_link').click(function() {
				smsSubscriptionLinkEnable();
			});
		}
	    }
	    subscriptionForm_configure('sms');
	}
	else {
		$('form[name="smsSubscriptionForm"]').remove();
		$('#smsSubscriptionLink').remove();
	}
}

/** Display smsSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function smsSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
	    	subscriptionForm_commonFields_display('sms');
		$('form[name="smsSubscriptionForm"]').show();
	}
	else {
		$('form[name="smsSubscriptionForm"]').hide();
		subscriptionForm_empty('sms');
	}
	subscriptionForm_phoneHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function smsSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on smsSubscriptionForm
 */
function smsSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#smsSubscriptionForm_back_button').attr("disabled", true);
			$('#smsSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#smsSubscriptionForm_back_button').attr("disabled", false);
			$('#smsSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function smsSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('sms');
    var callbacks = new Object();
    callbacks.beforeSend = function() { smsSubscriptionFormWaiting(true); };
    callbacks.success    = function() { smsSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { smsSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of smsSubscriptionFormSubscribe function
 */
function smsSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
	displayStep();
    }
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function smsSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	smsSubscriptionForm_display(true);
}

/*****************************************************************************/

/*****************************************************************************/
/****              Mail Subscription Form JavaScript functions            ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Buttons triggers
	 */
	$('#mailSubscriptionForm_back_button').click(function() {
		mailSubscriptionFormBack();
	});

	$('#mailSubscriptionForm_subscribe_button').click(function() {
		mailSubscriptionFormSubscribe();
	});

	/** Form triggers
	 */
	$('form[name="mailSubscriptionForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#mailSubscriptionLink').click(function() {
		mailSubscriptionLinkEnable();
	});
});


/** Configure mailSubscriptionForm depending on settings
 */
function mailSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.mail != undefined) {
	    // Moving link to right location
	    if($('#logonForm_subscriptionChoice_grid').length == 1) {
		$('#mailSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
	    }
	    else {
		if ($.settings.subscribe.count > 1) {
			$('#mailSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
		}
		else if ($.settings.subscribe.count == 1) {
			$('#logonFormSubscriptionLink_link').click(function() {
				mailSubscriptionLinkEnable();
			});
		}
	    }

		// Configure autofill/autoconnect
		if ( $.settings.subscribe.mail.autofill != undefined ) {
			$('form[name="logonForm"] input[name="login"]').val($.settings.subscribe.mail.autofill.login);
			$('form[name="logonForm"] input[name="password"]').val($.settings.subscribe.mail.autofill.password);
		}

		subscriptionForm_configure('mail');
	}
	else {
		$('form[name="mailSubscriptionForm"]').remove();
		$('#mailSubscriptionLink').remove();
	}
}

/** Display mailSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function mailSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
	    	subscriptionForm_commonFields_display('mail');
		$('form[name="mailSubscriptionForm"]').show();
	}
	else {
		$('form[name="mailSubscriptionForm"]').hide();
		subscriptionForm_empty('mail');
	}
	subscriptionForm_phoneHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function mailSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on mailSubscriptionForm
 */
function mailSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#mailSubscriptionForm_back_button').attr("disabled", true);
			$('#mailSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#mailSubscriptionForm_back_button').attr("disabled", false);
			$('#mailSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function mailSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('mail');
    var callbacks = new Object();
    callbacks.beforeSend = function() { mailSubscriptionFormWaiting(true); };
    callbacks.success    = function() { mailSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { mailSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of mailSubscriptionFormSubscribe function
 */
function mailSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
	displayStep();
    }
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function mailSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	mailSubscriptionForm_display(true);
}


/*****************************************************************************/
/****             Paypal Subscription Form JavaScript functions           ****/
/*****************************************************************************/

/** Listen to modified element
 */

var paypalSubscriptionResultForm_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */

	$('form[name="paypalSubscriptionResultForm"] input[name="send_sms"]').change(function() {
		paypalSubscriptionResultFormSend_display($(this).is(':checked'), "sms");
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="send_mail"]').change(function() {
		paypalSubscriptionResultFormSend_display($(this).is(':checked'), "mail");
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="email"]').focus(function() {
		paypalSubscriptionResultForm_modifyEvent('focus', $(this));
		paypalSubscriptionResultForm_phoneHelpBlock_display(false);
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="email"]').blur(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="email"]').change(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="prefix"]').focus(function() {
		paypalSubscriptionResultForm_modifyEvent('focus', $(this));
		paypalSubscriptionResultForm_phoneHelpBlock_display(true);
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="prefix"]').blur(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="prefix"]').change(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="phone"]').focus(function() {
		paypalSubscriptionResultForm_modifyEvent('focus', $(this));
		paypalSubscriptionResultForm_phoneHelpBlock_display(true);
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="phone"]').blur(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="paypalSubscriptionResultForm"] input[name="phone"]').change(function() {
		paypalSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	/** Buttons triggers
	 */
	$('#paypalSubscriptionForm_back_button').click(function() {
		paypalSubscriptionFormBack();
	});

	$('#paypalSubscriptionForm_subscribe_button').click(function() {
		paypalSubscriptionFormSubscribe();
	});

	$('#paypalSubscriptionResultForm_back_button').click(function() {
		displayStep();
	});

	$('#paypalSubscriptionResultForm_send_button').click(function() {
		paypalSubscriptionResultFormSendCredential();
	});

	/** Form triggers
	 */
	$('form[name="paypalSubscriptionForm"]').submit(function() {
		return false;
	});

	$('form[name="paypalSubscriptionResultForm"]').submit(function() {
		return false;
	});

	/** Link triggers
	 */
	$('#paypalSubscriptionLink').click(function() {
		paypalSubscriptionLinkEnable();
	});

	$('#paypalSubscriptionResultForm_send_sms_phone_help_link').click(function() {
		paypalSubscriptionResultForm_phoneHelpBlock_display();
	});
});

/** Configure paypalSubscriptionForm depending on settings
 */
function paypalSubscriptionForm_configure() {

	var showSendSms = true, showSendMail = true;
	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.paypal != undefined) {

		if ($.settings.subscribe.paypal.option != undefined) {
			$('#paypalSubscriptionForm_explain_text').text(getTextTranslation('paypalOptionSubscriptionForm_explain_text'));
		}

		if (($.settings.subscribe.paypal.option != undefined) || ($.settings.subscribe.paypal.package != undefined)) {
		// Moving link to right location
			if($('#logonForm_subscriptionChoice_grid').length == 1) {
				$('#paypalSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
			}
			else {
				if ($.settings.subscribe.count > 1) {
					$('#paypalSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
				}
				else if ($.settings.subscribe.count == 1) {
					$('#logonFormSubscriptionLink_link').click(function() {
						paypalSubscriptionLinkEnable();
					});
				}
			}
		}

		// Configure paypalSubscriptionResultForm
		if ($.settings.subscribe.paypal.sendSms != undefined && $.settings.subscribe.paypal.sendSms.display == true) {
			$('#paypalSubscriptionResultForm_send_sms_block').show();
			$('#paypalSubscriptionResultForm_send_sms_phone_block').hide();
			// Configure help block
			paypalSubscriptionResultForm_phoneHelpBlock_configure();
		}
		else {
			$('#paypalSubscriptionResultForm_send_sms_block').remove();
			$('#paypalSubscriptionResultForm_send_sms_phone_block').remove();
			showSendSms = false;
		}
		if ($.settings.subscribe.paypal.sendMail != undefined && $.settings.subscribe.paypal.sendMail.display == true) {
			$('#paypalSubscriptionResultForm_send_mail_block').show();
			$('#paypalSubscriptionResultForm_send_email_address_block').hide();
		}
		else {
			$('#paypalSubscriptionResultForm_send_mail_block').remove();
			$('#paypalSubscriptionResultForm_send_email_address_block').remove();
			showSendMail = false;
		}

		if (showSendMail == false && showSendSms == false) {
			// Remove send button if Mail and Sms paypal subscription mode not activated
			$('#paypalSubscriptionResultForm_send_button').remove();
		}

		// autofill/autoconnect
		if ( $.settings.subscribe.paypal.autofill != undefined ) {
			$('form[name="logonForm"] input[name="login"]').val($.settings.subscribe.paypal.autofill.login);
			$('form[name="logonForm"] input[name="password"]').val($.settings.subscribe.paypal.autofill.password);
		}

		subscriptionForm_configure('paypal');
	}
	else {
		$('form[name="paypalSubscriptionForm"]').remove();
		$('form[name="paypalSubscriptionResultForm"]').remove();
		$('form[name="paypalRedirectForm"]').remove();
		$('#paypalSubscriptionLink').remove();
	}
}

/** Display paypalSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function paypalSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		subscriptionForm_commonFields_display('paypal');
		$('form[name="paypalSubscriptionForm"]').show();

		if ($.settings.subscribe.paypal.option != undefined) {
			$('#paypalSubscriptionForm_explain_text').text(getTextTranslation('paypalOptionSubscriptionForm_explain_text'));
		}
	}
	else {
		$('form[name="paypalSubscriptionForm"]').hide();
		subscriptionForm_empty('paypal');
	}

	$('form[name="paypalSubscriptionResultForm"]').hide();

	subscriptionForm_phoneHelpBlock_display(false);
	subscriptionForm_passwordHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function paypalSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on paypalSubscriptionForm
 */
function paypalSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#paypalSubscriptionForm_back_button').attr("disabled", true);
			$('#paypalSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#paypalSubscriptionForm_back_button').attr("disabled", false);
			$('#paypalSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function paypalSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('paypal');
    var callbacks = new Object();
    callbacks.beforeSend = function() { paypalSubscriptionFormWaiting(true); };
    callbacks.success    = function() { paypalSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { paypalSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of paypalSubscriptionFormSubscribe function
 */
function paypalSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
		paypalPaymentForm_packages_configure();
		paypalSubscriptionResultForm_display(true);
    }
}

/** Display paypalSubscriptionResultForm (Usualy Triggered when subscribtion succeed)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function paypalSubscriptionResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if ($.settings.info != undefined && $.settings.info.subscribe != undefined) {
		if ($.settings.info.subscribe.login != undefined) {
			$('#paypalSubscriptionResultForm_login_value').html($.settings.info.subscribe.login);
		}
		if ($.settings.info.subscribe.password != undefined) {
			var tmp_input_params = subscriptionFormSubscribe('paypal');
			if ($.settings.subscribe != undefined && $.settings.subscribe.paypal != undefined
					&& $.settings.subscribe.paypal.userPassword != undefined && $.settings.subscribe.paypal.userPassword.display == true
					&& tmp_input_params.password != '') {
				// We hide the given password
				$('#paypalSubscriptionResultForm_password_value').html('********');
			}
			else {
				$('#paypalSubscriptionResultForm_password_value').html($.settings.info.subscribe.password);
			}
		}
		$('form[name="paypalSubscriptionResultForm"] input[name="end_sms"]').attr("checked", false);

		if (subscriptionForm_changed['prefix'] == true) {
			paypalSubscriptionResultForm_changed['prefix'] = true;
			$('form[name="paypalSubscriptionResultForm"] input[name="prefix"]').val($('form[name="paypalSubscriptionForm"] input[name="prefix"]').val());
		}
		if (subscriptionForm_changed['phone'] == true) {
			paypalSubscriptionResultForm_changed['phone'] = true;
			$('form[name="paypalSubscriptionResultForm"] input[name="phone"]').val($('form[name="paypalSubscriptionForm"] input[name="phone"]').val());
		}
		if (subscriptionForm_changed['email'] == true) {
			paypalSubscriptionResultForm_changed['email'] = true;
			$('form[name="paypalSubscriptionResultForm"] input[name="email"]').val($('form[name="paypalSubscriptionForm"] input[name="email"]').val());
		}

		// Fill in logon fields
		$('form[name="logonForm"] input[name="login"]').val($.settings.info.subscribe.login);
		$('form[name="logonForm"] input[name="password"]').val($.settings.info.subscribe.password);
	}

	if (display == true) {
		$('form[name="paypalSubscriptionResultForm"]').show();
		$('form[name="paypalSubscriptionForm"]').hide();
	}
	else {
		$('form[name="paypalSubscriptionForm"]').show();

		if ($.settings.subscribe.paypal.option != undefined) {
			$('#paypalSubscriptionForm_explain_text').text(getTextTranslation('paypalOptionSubscriptionForm_explain_text'));
		}

		$('form[name="paypalSubscriptionResultForm"]').hide();
		paypalSubscriptionResultForm_empty();
	}
	paypalSubscriptionResultForm_phoneHelpBlock_display(false);

	if ($.settings.subscribe.paypal.option != undefined) {
		$('#paypalSubscriptionResultForm_back_button').text(getTextTranslation('paypalOptionSubscriptionResultForm_back_button'));
	}
}

/** Empty paypalSubscriptionResultForm
 */
function paypalSubscriptionResultForm_empty() {

	$('form[name="paypalSubscriptionResultForm"] input[type="text"]').each(function() {
		$(this).val('');
	});
	$('form[name="paypalSubscriptionResultForm"] input[type="checkbox"]').each(function() {
		$(this).attr("checked", false);
	});
	$('#paypalSubscriptionResultForm_result_login_value').html('');
	$('#paypalSubscriptionResultForm_result_password_value').html('');

	// Adding examples values
	paypalSubscriptionResultForm_phoneHelpBlock_configure();

	paypalSubscriptionResultForm_changed['prefix'] = false;
	paypalSubscriptionResultForm_changed['phone'] = false;
	paypalSubscriptionResultForm_changed['email'] = false;
}

/** Display paypalSubscriptionResultForm_send_sms_phone_help_block when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function paypalSubscriptionResultForm_phoneHelpBlock_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#paypalSubscriptionResultForm_send_sms_phone_help_block').is(':hidden') == true) {
		display = true;
	}

	if (display == true) {
		$('#paypalSubscriptionResultForm_send_sms_phone_help_block').show();
	}
	else {
		$('#paypalSubscriptionResultForm_send_sms_phone_help_block').hide();
	}
}

/** Configure paypalSubscriptionResultForm_send_sms_phone_help_block
 * @param string displayLang - The language whish to display the content
 */
function paypalSubscriptionResultForm_phoneHelpBlock_configure(displayLang) {

	if (paypalSubscriptionResultForm_changed['prefix'] != true) {
		$('#paypalSubscriptionResultForm_send_sms_phone_prefix_value').val(getInputTranslation("paypalSubscriptionResultForm_send_sms_phone_prefix_value", displayLang));
	}
	if (paypalSubscriptionResultForm_changed['phone'] != true) {
		$('#paypalSubscriptionResultForm_send_sms_phone_phone_value').val(getInputTranslation("paypalSubscriptionResultForm_send_sms_phone_phone_value", displayLang));
	}
	$('#paypalSubscriptionResultForm_send_sms_phone_help_prefix_example_value').val(getInputTranslation("paypalSubscriptionResultForm_send_sms_phone_help_prefix_example_value", displayLang));
	$('#paypalSubscriptionResultForm_send_sms_phone_help_phone_example_value').val(getInputTranslation("paypalSubscriptionResultForm_send_sms_phone_help_phone_example_value", displayLang));
}

function paypalSubscriptionResultFormSend_display(state, mode) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}

	if (display == true) {
		if (mode == "sms") {
			$('#paypalSubscriptionResultForm_send_sms_phone_block').show();
		}
		if (mode == "mail") {
			$('#paypalSubscriptionResultForm_send_email_address_block').show();
		}
		if ($('#paypalSubscriptionResultForm_send_email_address_block').is(':visible') || $('#paypalSubscriptionResultForm_send_sms_phone_block').is(':visible')) {
			$('#paypalSubscriptionResultForm_send_button').show();
		}
	}
	else {
		if (mode == "sms") {
			$('#paypalSubscriptionResultForm_send_sms_phone_block').hide();
			if ($('#paypalSubscriptionResultForm_send_email_address_block').length == 0) {
				// Hide if SMS mode only visible on portal
				$('#paypalSubscriptionResultForm_send_button').hide();
			}
		}
		if (mode == "mail") {
			$('#paypalSubscriptionResultForm_send_email_address_block').hide();
			if ($('#paypalSubscriptionResultForm_send_sms_phone_block').length == 0) {
				// Hide if Mail mode only visible on portal
				$('#paypalSubscriptionResultForm_send_button').hide();
			}
		}
		if ($('#paypalSubscriptionResultForm_send_email_address_block').is(':hidden') && $('#paypalSubscriptionResultForm_send_sms_phone_block').is(':hidden')) {
			$('#paypalSubscriptionResultForm_send_button').hide();
		}
	}
	paypalSubscriptionResultForm_phoneHelpBlock_display(false);
}

/** Enable waiting mode on paypalSubscriptionResultForm
 */
function paypalSubscriptionResultFormWaiting(state) {
	switch (state) {
		case true:
			$('#paypalSubscriptionResultForm_back_button').attr("disabled", true);
			$('#paypalSubscriptionResultForm_send_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#paypalSubscriptionResultForm_back_button').attr("disabled", false);
			$('#paypalSubscriptionResultForm_send_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function paypalSubscriptionResultFormSendCredential() {

	var params = new Object();
	var sendMailOption = $('form[name="paypalSubscriptionResultForm"] input[name="send_mail"]').is(":checked");
	var sendSmsOption = $('form[name="paypalSubscriptionResultForm"] input[name="send_sms"]').is(":checked");

	params.login = $('form[name="logonForm"] input[name="login"]').val();
	params.password = $('form[name="logonForm"] input[name="password"]').val();

	params.prefix = (paypalSubscriptionResultForm_changed['prefix'] == true) ? $('form[name="paypalSubscriptionResultForm"] input[name="prefix"]').val() : "";
	params.phone = (paypalSubscriptionResultForm_changed['phone'] == true) ? $('form[name="paypalSubscriptionResultForm"] input[name="phone"]').val() : "";
	params.email = (paypalSubscriptionResultForm_changed['email'] == true) ? $('form[name="paypalSubscriptionResultForm"] input[name="email"]').val() : "";

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { paypalSubscriptionResultFormWaiting(true); };
	callbacks.success    = function() { paypalSubscriptionResultFormSendCredentialCallback(); };
	callbacks.complete   = function() { paypalSubscriptionResultFormWaiting(false); };

	if ($.settings.subscribe.paypal.sendMail != undefined && $.settings.subscribe.paypal.sendMail.display == true && sendMailOption) {
		params.action = "paypal_send_mail";
		subscriptionSendCredential(callbacks, params);
	}
	if ($.settings.subscribe.paypal.sendSms != undefined && $.settings.subscribe.paypal.sendSms.display == true && sendSmsOption) {
		params.action = "paypal_send_sms";
		subscriptionSendCredential(callbacks, params);
	}

}

function paypalSubscriptionResultFormSendCredentialCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		displayStep();
	}
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function paypalSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	paypalSubscriptionForm_display(true);
}

/*****************************************************************************/

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function paypalSubscriptionResultForm_modifyEvent(type, element) {
	switch (type) {
		case 'focus':
			if (paypalSubscriptionResultForm_changed[element.attr("name")] != true) {
				element.val("");
			}
			break;

		case 'blur':
			if (element.val() == "") {
				element.val(getInputTranslation(element.attr("id")));
				paypalSubscriptionResultForm_changed[element.attr("name")] = false;
			}
			else {
				paypalSubscriptionResultForm_changed[element.attr("name")] = true;
			}
			break;
	}
}


/*****************************************************************************/
/****                Paypal Payment Form JavaScript functions             ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
	$('form[name="paypalPaymentForm"] select[name="select_package"]').change(function() {
		paypalPaymentForm_packages_describe();
		paypalPaymentFormPay();
	});
	$('form[name="paypalPaymentForm"] select[name="select_package"]').keyup(function() {
		paypalPaymentForm_packages_describe();
		paypalPaymentFormPay();
	});

	/** Buttons triggers
	 */
	$('#paypalPaymentForm_back_button').click(function() {
		paypalPaymentFormRefillBack();
	});
	$('#paypalPaymentForm_disconnect_button').click(function() {
		paypalPaymentFormBack();
	});
	$('#paypalPaymentForm_pay_button').click(function() {
		paypalPaymentFormPay();
	});
	$('#paypalPaymentResultForm_disconnect_button').click(function() {
		paypalPaymentResultForm_disconnect();
	});
	$('#paypalPaymentResultForm_connect_button').click(function() {
		paypalPaymentResultForm_connect();
	});
	/** Form triggers
	 */
	$('form[name="paypalPaymentForm"]').submit(function() {
		return false;
	});
	$('form[name="paypalPaymentResultForm"]').click(function() {
		return false;
	});
	$('#paypalRedirectionForm_pay_button').click(function() {
		// Update order status through API
		paypalRedirectFormPay();
	});
});


function paypalRedirectFormPay()
{
	var params = new Object();
	params.login = $.settings.payment.login;
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	var callbacks = new Object();
	callbacks.beforeSend = function() { paypalPaymentFormWaiting(true); };
	callbacks.success    = function() { paypalRedirectFormPayCallback(); };
	callbacks.complete   = function() { paypalPaymentFormWaiting(false); };
	paypalSubmitPayment(callbacks, params);
}

function paypalRedirectFormPayCallback() {
	if ($.settings.error == undefined) {
		paypalPaymentForm_display(false);
		displayStep();

	}
	displayErrorInfo();
}


/** send and submit paypal payment information */

function paypalSendPaymentForm()
{
	$('form[name="paypalRedirectForm"] input[name="encrypted"]').val($.settings.payment.packageEncr);
	$('form[name="paypalRedirectForm"]').attr('action', $.settings.payment.paypalUrlPost);
	var url = $.settings.payment.paypalUrlPost + "?cmd=_express-checkout&useraction=commit&token=" + $.settings.payment.token;
	$.settings.payment.token="";
	displayWaitingIcon(true);
	window.location = url;
}



/** Configure paypalPaymentForm depending on settings
 */
function paypalPaymentForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.paypal != undefined) {
		// Add packages
		paypalPaymentForm_packages_configure();
	}
	else {
		$('form[name="paypalPaymentForm"]').remove();
		$('form[name="paypalPaymentResultForm"]').remove();
	}
}

function paypalPaymentForm_packages_configure(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.paypal != undefined) {
		var paypalInfos = null;
		var defaultOptionText;

		if ($.settings.subscribe.paypal.package != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var paypalInfos = $.settings.subscribe.paypal.package;
			// Keep default option
			defaultOptionText = $('#paypalPaymentForm_default_package_option').text();
		}
		else if ($.settings.subscribe.paypal.option != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var paypalInfos = $.settings.subscribe.paypal.option;
			defaultOptionText = getTextTranslation('paypalOptionPaymentForm_default_package_option');
			$('#paypalPaymentForm_select_package_text').text(getTextTranslation('paypalOptionPaymentForm_select_package_text'));
			$('#paypalPaymentForm_title_text').text(getTextTranslation('paypalOptionPaymentForm_title_text'));
			$('#paypalPaymentForm_explain_text').text(getTextTranslation('paypalOptionPaymentForm_explain_text'));
			$('#paypalPaymentForm_package_description_explain').text(getTextTranslation('paypalOptionPaymentForm_package_description_explain'));
			$('#paypalPaymentForm_package_description_text').text(getTextTranslation('paypalOptionPaymentForm_package_description_text'));
		}
		else {
			return;
		}

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}

		// Empty the select list
		$('form[name="paypalPaymentForm"] select[name="select_package"]').empty();
		$('form[name="paypalPaymentForm"] select[name="select_package"]').append('<option id="paypalPaymentForm_default_package_option" disabled selected value="">' + defaultOptionText + '</option>');
		// Populate list
		$(paypalInfos).each(function () {
			var package = $(this)[0];
			var text;
			var currencyLanguage;
			if (package[displayLang] != undefined) {
				text = package[displayLang].text;
				currencyLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
			}
			else if (package[package.defaultLang] != undefined) {
				text = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
			}
			else {
				text = "";
				currencyLanguage = package.defaultLang;
			}

			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}

			$('form[name="paypalPaymentForm"] select[name="select_package"]').append('<option value="' + package.name + '"' + '>' + text + '</option>');
		});
	}
}

/** Display paypalPaymentForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function paypalPaymentForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "PAYMENT") && ($.settings.type != undefined && $.settings.type == "PAYPAL") ) {
		display = true;
	}
	if (display == true) {
		// waiting for payment, display result form
		if( $.settings.payment.status=="waiting_paypal" || $.settings.payment.status=="verifying"  )
		{
			paypalPaymentForm_display(false);
			if($.settings.payment.status=="verifying")paypalPaymentResultForm_verify();
			if($.settings.payment.status=="waiting_paypal")paypalSendPaymentForm();
		}
		// otherwise, select package form
		else
		{
			// deal with users already exists otherwise, select package form
			if ($.settings.payment && $.settings.payment.process == 'create' && $.settings.payment.status == 'init' && $.settings.payment.user_exists != undefined && $.settings.payment.user_exists == true) {
				paypalPaymentForm_packages_configure();
				paypalPaymentForm_packages_describe();
			}

			$('form[name="paypalPaymentForm"]').show();

			if ($.settings.payment && $.settings.payment.process == 'refill') {
				$('#paypalPaymentForm_back_button').show();
				$('#paypalPaymentForm_disconnect_button').hide();
			}
			else {
				$('#paypalPaymentForm_disconnect_button').show();
				$('#paypalPaymentForm_back_button').hide();
			}
		}
	}
	else {
		$('form[name="paypalPaymentForm"]').hide();
		$('#paypalPaymentForm_package_description_explain').show();
		$('#paypalPaymentForm_package_description_value').html('');
		paypalPaymentForm_packages_configure();
		paypalPaymentForm_packages_describe();
		$('form[name="paypalRedirectForm"]').hide();
	}
}

/** Executed when back button is clicked
 */
function paypalPaymentFormBack() {
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { paypalPaymentFormBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	backAction(callbacks);
}

/** Executed on return of paypalPaymentFormBack function
 */
function paypalPaymentFormBackCallback() {

	if ($.settings != undefined && $.settings.payment != undefined) {
		delete $.settings.payment;
		$.settings.payment = new Object();
	}

	displayErrorInfo();
	displayStep();
}

function paypalPaymentFormRefillBack() {
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { paypalPaymentFormRefillBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	backAction(callbacks);
}

function paypalPaymentFormRefillBackCallback() {

	if ($.settings != undefined && $.settings.payment != undefined) {
		delete $.settings.payment;
		$.settings.payment = new Object();
	}

	paypalPaymentForm_display(false);
	accountRefillForm_display(true);
	accountRefillForm_options_configure();
	accountRefillForm_options_describe();
}

/** Enable waiting mode on paypalPaymentForm
 */
function paypalPaymentFormWaiting(state) {
	switch (state) {
		case true:
			$('#paypalPaymentForm_back_button').attr("disabled", true);
			$('#paypalPaymentForm_disconnect_button').attr("disabled", true);
			$('#paypalPaymentForm_pay_button').attr("disabled", true);
			$('#paypalPaymentResultForm_disconnect_button').attr("disabled", true);
			$('#paypalPaymentResultForm_connect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#paypalPaymentForm_back_button').attr("disabled", false);
			$('#paypalPaymentForm_disconnect_button').attr("disabled", false);
			$('#paypalPaymentForm_pay_button').attr("disabled", false);
			$('#paypalPaymentResultForm_disconnect_button').attr("disabled", false);
			$('#paypalPaymentResultForm_connect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when pay button is clicked
 */
function paypalPaymentFormPay() {

	var params = new Object();

	params.package = $('form[name="paypalPaymentForm"] select[name="select_package"]').val();

	if (($.settings.user != undefined) && ($.settings.user.securePwd != undefined)) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	var callbacks = new Object();
	callbacks.beforeSend = function() { paypalPaymentFormWaiting(true); };
	callbacks.success    = function() { paypalPaymentFormPayCallback(); };
	callbacks.complete   = function() { paypalPaymentFormWaiting(false); };
	selectPaypalPackage(callbacks, params);
}

/** Executed on return of paypalPaymentFormPay function
 */
function paypalPaymentFormPayCallback() {

	displayErrorInfo();
	if($.settings.error == undefined)
	{
		$('form[name="paypalRedirectForm"]').show();
	}
	else
	{
		$('form[name="paypalRedirectForm"]').hide();
	}
}

function paypalPaymentForm_packages_describe(displayLang) {
	if ($.settings.subscribe != undefined && $.settings.subscribe.paypal != undefined) {

		var paypalInfos = null;
		if ($.settings.subscribe.paypal.package != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var paypalInfos = $.settings.subscribe.paypal.package;
		}
		else if ($.settings.subscribe.paypal.option != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var paypalInfos = $.settings.subscribe.paypal.option;
		}
		else {
			return;
		}

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		// Update describe block
		if ($('form[name="paypalPaymentForm"] select[name="select_package"]').val() == "") {
			$('#paypalPaymentForm_package_description_explain').show();
			$('#paypalPaymentForm_package_description_value').html("");
		}
		else {
			$(paypalInfos).each(function () {
				var package = $(this)[0];
				if (package.name == $('form[name="paypalPaymentForm"] select[name="select_package"]').val()) {
					var describe;
					if (package[displayLang] != undefined) {
						describe = package[displayLang].description;
					}
					else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
						describe = package[$.settings.lang.defaultLang].description;
					}
					else if (package[package.defaultLang] != undefined) {
						describe = package[package.defaultLang].description;
					}

					if (describe == undefined) {
						describe = getTextTranslation('accountRefillForm_no_description');
					}

					$('#paypalPaymentForm_package_description_explain').hide();
					$('#paypalPaymentForm_package_description_value').html(describe);
				}
			});
		}
	}
}

function paypalPaymentForm_options_describe() {

	var displayLang = $.settings.user.lang;
	var paypalInfos = $.settings.subscribe.paypal.refill;
	var package = null;
	var describe;
	var text;
	var currencyLanguage;
	$('#paypalPaymentForm_select_package_text').text(getTextTranslation('accountRefillForm_option_buyed_text'));
	$('#paypalPaymentForm_title_text').text(getTextTranslation('paypalOptionPaymentForm_title_text'));
	$('#paypalPaymentForm_explain_text').text(getTextTranslation('paypalOptionPaymentForm_refill_text'));
	$('#paypalPaymentForm_package_description_explain').text(getTextTranslation('paypalOptionPaymentForm_package_description_explain'));
	$('#paypalPaymentForm_package_description_text').text(getTextTranslation('paypalOptionPaymentForm_package_description_text'));

	$(paypalInfos).each(function () {
		var package = $(this)[0];

		if (package.name == $.settings.payment.package) {

			if (package[displayLang] != undefined) {
				text             = package[displayLang].text;
				currencyLanguage = displayLang;
				describe         = package[displayLang].description;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text             = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
				describe         = package[$.settings.lang.defaultLang].description;
			}
			else if (package[package.defaultLang] != undefined) {
				text             = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
				describe         = package[package.defaultLang].description;
			}
			else {
				text             = "";
				currencyLanguage = package.defaultLang;
			}

			if (describe == undefined) {
				describe = getTextTranslation('accountRefillForm_no_description');
			}

			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}
			$('#paypalPaymentForm_package_description_explain').hide();
			$('#paypal_select_list').hide();
			$('#paypalPaymentForm_package_description_value').html(describe);
			$('#paypalPaymentForm_payment_detail_value').html(text);
		}
	});

	if($.settings.error == undefined)
	{
		$('form[name="paypalRedirectForm"]').show();
	}
}

/** Display paypalPaymentResultForm (Usualy Triggered when pay button clicked)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function paypalPaymentResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		displayWaitingIcon(false);
		$('form[name="paypalPaymentResultForm"]').show();
		if($.settings.payment.status=="completed")
		{
			displayErrorInfo();
			$("#paypalPaymentResultForm_payment_timer_text").hide();
			if ($.settings.payment.process == "create") {
				$("#paypalPaymentResultForm_connect_button").show();
			}
			else if ($.settings.payment.process == "refill") {
				$('form[name="paypalPaymentForm"]').remove();
				$('form[name="paypalPaymentResultForm"]').remove();
				accountRefillForm_paymentValidate();
			}
		}
		else
		{
			displayErrorInfo();
			$("#paypalPaymentResultForm_connect_button").hide();
			if ($.settings.user.paymentTimer != undefined && $.settings.user.paymentTimer.value != undefined) {
				$("#paypalPaymentResultForm_payment_timer_text").show();
				$.settings.user.paymentTimer.value = 10;
				paypalPaymentResultForm_payment_timer_start();
			}
			else {
				$("#paypalPaymentResultForm_payment_timer_text").hide();
			}
		}
	}
	else {
		$('form[name="paypalPaymentResultForm"]').hide();
	}

	if (($.settings.subscribe.paypal.option != undefined) || ($.settings.subscribe.paypal.refill != undefined)){
		$('#paypalSubscriptionResultForm_back_button').text(getTextTranslation('paypalOptionSubscriptionResultForm_back_button'));
	}
}



/** Executed when connect comming back from Paypal payment site
 */
function paypalPaymentResultForm_verify() {
	if ($.settings.payment != undefined) {
		var params = new Object();
		var callbacks = new Object();
		params.login = $.settings.payment.login;
		params.policyAccept = $.settings.payment.policyAccept;
		callbacks.beforeSend = function() { paypalPaymentFormWaiting(true); };
		callbacks.success    = function() { paypalPaymentResultForm_display(true); };
		callbacks.complete   = function() { paypalPaymentFormWaiting(false); };
		displayWaitingIcon(true);
		verifyPayment(callbacks,params);
	}
	else {

		displayStep();
	}

}


/** Executed on return of verification of Paypal payment
 */
function paypalPaymentResultForm_connect() {
	if($.settings.error == undefined)
	{
		// user payed, follow auto connect link
		paypalPaymentResultForm_payment_timer_stop();
		delete $.settings.user.paymentTimer;
		if($.settings.payment.status=="completed")
		{
			paypalPaymentResultForm_display(false);
			window.location = $.settings.payment.a_connect_link;
		}
		else {
			paypalPaymentResultForm_disconnect();
		}
	}
	else
	{
		paypalPaymentResultForm_disconnect();
		displayErrorInfo();
	}
}


/** Executed when disconnect button is clicked
 */
function paypalPaymentResultForm_disconnect() {
	paypalPaymentResultForm_payment_timer_stop();
	paypalPaymentResultForm_display(false);
	delete $.settings.user.paymentTimer;
	if($.settings.user.isConnected)
		feedbackFormDisconnect();
	else
		paypalPaymentFormBack();
}

function paypalPaymentResultForm_payment_timer_start() {
	if($.settings.user.paymentTimer != undefined && $.settings.user.paymentTimer.value != undefined) {
			if (timerObj.paymentTimer == undefined) {
				timerObj.paymentTimer = new Array();
				timerObj.paymentTimer.refreshInterval = 1000;
				timerObj.paymentTimer.value = $.settings.user.paymentTimer.value;
				timerObj.paymentTimer.resource = window.setInterval(function() { paypalPaymentResultForm_payment_timer_display();}, timerObj.paymentTimer.refreshInterval);

			}
	}
}


function paypalPaymentResultForm_payment_timer_stop() {
	$('#paypalPaymentResultForm_payment_timer').text('-');
	if (timerObj.paymentTimer != undefined && timerObj.paymentTimer.resource != undefined) {
		window.clearInterval(timerObj.paymentTimer.resource);
		delete timerObj.paymentTimer;
	}
}

function paypalPaymentResultForm_payment_timer_display() {
	if (timerObj.paymentTimer != undefined && timerObj.paymentTimer.value != undefined) {
		timerObj.paymentTimer.value--;
		if (timerObj.paymentTimer.value > 0) {
			var hours = Math.floor(timerObj.paymentTimer.value / 3600);
			var mins = Math.floor((timerObj.paymentTimer.value - (hours * 3600)) / 60);
			var seconds = timerObj.paymentTimer.value - (hours * 3600) - (mins * 60);

			var hours_label = getGenericTranslation('hour', null, (hours > 1));
			var mins_label = getGenericTranslation('minute', null, (mins > 1));
			var seconds_label = getGenericTranslation('second', null, (seconds > 1));

			$('#paypalPaymentResultForm_payment_timer_text').text(getTextTranslation('feedbackForm_automatic_disconnection_text'));

			if( hours > 0 )
			{
				$('#paypalPaymentResultForm_payment_timer_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-with-seconds'), hours, hours_label, mins, mins_label,
												seconds, seconds_label));
			}
			else
			{
				$('#paypalPaymentResultForm_payment_timer_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-without-hours'), mins, mins_label, seconds, seconds_label));
			}
		}
		else {
			paypalPaymentResultForm_disconnect();
		}
	}
}


/*****************************************************************************/
/****             Ogone Subscription Form JavaScript functions           ****/
/*****************************************************************************/

/** Listen to modified element
 */
var ogoneSubscriptionResultForm_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
	$('form[name="ogoneSubscriptionResultForm"] input[name="send_sms"]').change(function() {
		ogoneSubscriptionResultFormSend_display($(this).is(':checked'), "sms");
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="send_mail"]').change(function() {
		ogoneSubscriptionResultFormSend_display($(this).is(':checked'), "mail");
	});

	$('form[name="ogoneSubscriptionResultForm"] input[name="email"]').focus(function() {
		ogoneSubscriptionResultForm_modifyEvent('focus', $(this));
		ogoneSubscriptionResultForm_phoneHelpBlock_display(false);
	});

	$('form[name="ogoneSubscriptionResultForm"] input[name="email"]').blur(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="ogoneSubscriptionResultForm"] input[name="email"]').change(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});

	$('form[name="ogoneSubscriptionResultForm"] input[name="prefix"]').focus(function() {
		ogoneSubscriptionResultForm_modifyEvent('focus', $(this));
		ogoneSubscriptionResultForm_phoneHelpBlock_display(true);
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="prefix"]').blur(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="prefix"]').change(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="phone"]').focus(function() {
		ogoneSubscriptionResultForm_modifyEvent('focus', $(this));
		ogoneSubscriptionResultForm_phoneHelpBlock_display(true);
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="phone"]').blur(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});
	$('form[name="ogoneSubscriptionResultForm"] input[name="phone"]').change(function() {
		ogoneSubscriptionResultForm_modifyEvent('blur', $(this));
	});
	/** Buttons triggers
	 */
	$('#ogoneSubscriptionForm_back_button').click(function() {
		ogoneSubscriptionFormBack();
	});
	$('#ogoneSubscriptionForm_subscribe_button').click(function() {
		ogoneSubscriptionFormSubscribe();
	});
	$('#ogoneSubscriptionResultForm_back_button').click(function() {
		displayStep();
	});
	$('#ogoneSubscriptionResultForm_send_button').click(function() {
		ogoneSubscriptionResultFormSendCredential();
	});
	/** Form triggers
	 */
	$('form[name="ogoneSubscriptionForm"]').submit(function() {
		return false;
	});
	$('form[name="ogoneSubscriptionResultForm"]').submit(function() {
		return false;
	});
	/** Link triggers
	 */
	$('#ogoneSubscriptionLink').click(function() {
		ogoneSubscriptionLinkEnable();
	});
	$('#ogoneSubscriptionResultForm_send_sms_phone_help_link').click(function() {
		ogoneSubscriptionResultForm_phoneHelpBlock_display();
	});
});

/** Configure ogoneSubscriptionForm depending on settings
 */
function ogoneSubscriptionForm_configure() {
	var showSendSms = true, showSendMail = true;
	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.ogone != undefined) {

		if ($.settings.subscribe.ogone.option != undefined) {
			$('#ogoneSubscriptionForm_explain_text').text(getTextTranslation('ogoneOptionSubscriptionForm_explain_text'));
		}

		if (($.settings.subscribe.ogone.option != undefined) || ($.settings.subscribe.ogone.package != undefined)) {
			// Moving link to right location
			if($('#logonForm_subscriptionChoice_grid').length == 1) {
				$('#ogoneSubscriptionLink').appendTo('#logonForm_subscriptionChoice_grid').show();
			}
			else {
				if ($.settings.subscribe.count > 1) {
					$('#ogoneSubscriptionLink').appendTo('#subscriptionChoiceInsert').show();
				}
				else if ($.settings.subscribe.count == 1) {
					$('#logonFormSubscriptionLink_link').click(function() {
						ogoneSubscriptionLinkEnable();
					});
				}
			}
		}
		// Configure ogoneSubscriptionResultForm
		if ($.settings.subscribe.ogone.sendSms != undefined && $.settings.subscribe.ogone.sendSms.display == true) {
			$('#ogoneSubscriptionResultForm_send_sms_block').show();
			$('#ogoneSubscriptionResultForm_send_sms_phone_block').hide();
			// Configure help block
			ogoneSubscriptionResultForm_phoneHelpBlock_configure();
		}
		else {
			$('#ogoneSubscriptionResultForm_send_sms_block').remove();
			$('#ogoneSubscriptionResultForm_send_sms_phone_block').remove();
			showSendSms = false;
		}

		if ($.settings.subscribe.ogone.sendMail != undefined && $.settings.subscribe.ogone.sendMail.display == true) {
			$('#ogoneSubscriptionResultForm_send_mail_block').show();
			$('#ogoneSubscriptionResultForm_send_email_address_block').hide();
		}
		else {
			$('#ogoneSubscriptionResultForm_send_mail_block').remove();
			$('#ogoneSubscriptionResultForm_send_email_address_block').remove();
			showSendMail = false;
		}

		if (showSendMail == false && showSendSms == false) {
			// Remove send button if Mail and Sms ogone subscription mode not activated
			$('#ogoneSubscriptionResultForm_send_button').remove();
		}
		// autofill/autoconnect link
		if ( $.settings.subscribe.ogone.autofill != undefined ) {
			$('form[name="logonForm"] input[name="login"]').val($.settings.subscribe.ogone.autofill.login);
			$('form[name="logonForm"] input[name="password"]').val($.settings.subscribe.ogone.autofill.password);
		}

		subscriptionForm_configure('ogone');
	}
	else {
		$('form[name="ogoneSubscriptionForm"]').remove();
		$('form[name="ogoneSubscriptionResultForm"]').remove();
		$('form[name="ogoneRedirectForm"]').remove();
		$('#ogoneSubscriptionLink').remove();
	}
}

/** Display ogoneSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function ogoneSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		subscriptionForm_commonFields_display('ogone');
		$('form[name="ogoneSubscriptionForm"]').show();

		if ($.settings.subscribe.ogone.option != undefined) {
			$('#ogoneSubscriptionForm_explain_text').text(getTextTranslation('ogoneOptionSubscriptionForm_explain_text'));
		}

	}
	else {
		$('form[name="ogoneSubscriptionForm"]').hide();
		subscriptionForm_empty('ogone');
	}

	$('form[name="ogoneSubscriptionResultForm"]').hide();

	subscriptionForm_phoneHelpBlock_display(false);
	subscriptionForm_passwordHelpBlock_display(false);
}

/** Executed when back button is clicked
 */
function ogoneSubscriptionFormBack() {
    displayStep();
}

/** Enable waiting mode on ogoneSubscriptionForm
 */
function ogoneSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#ogoneSubscriptionForm_back_button').attr("disabled", true);
			$('#ogoneSubscriptionForm_subscribe_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#ogoneSubscriptionForm_back_button').attr("disabled", false);
			$('#ogoneSubscriptionForm_subscribe_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when subscribe button is clicked
 */
function ogoneSubscriptionFormSubscribe() {
    var params = subscriptionFormSubscribe('ogone');
    var callbacks = new Object();
    callbacks.beforeSend = function() { ogoneSubscriptionFormWaiting(true); };
    callbacks.success    = function() { ogoneSubscriptionFormSubscribeCallback(); };
    callbacks.complete   = function() { ogoneSubscriptionFormWaiting(false); };
    subscribe(callbacks, params);
}

/** Executed on return of ogoneSubscriptionFormSubscribe function
 */
function ogoneSubscriptionFormSubscribeCallback() {
    displayErrorInfo();
    if ($.settings.error == undefined) {
		ogonePaymentForm_packages_configure();
		ogoneSubscriptionResultForm_display(true);
    }
}

/** Display ogoneSubscriptionResultForm (Usualy Triggered when subscribtion succeed)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function ogoneSubscriptionResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if ($.settings.info != undefined && $.settings.info.subscribe != undefined) {
		if ($.settings.info.subscribe.login != undefined) {
			$('#ogoneSubscriptionResultForm_login_value').html($.settings.info.subscribe.login);
		}
		if ($.settings.info.subscribe.password != undefined) {
			var tmp_input_params = subscriptionFormSubscribe('ogone');
			if ($.settings.subscribe != undefined && $.settings.subscribe.ogone != undefined
					&& $.settings.subscribe.ogone.userPassword != undefined && $.settings.subscribe.ogone.userPassword.display == true
					&& tmp_input_params.password != '') {
				// We hide the given password
				$('#ogoneSubscriptionResultForm_password_value').html('********');
			}
			else {
				$('#ogoneSubscriptionResultForm_password_value').html($.settings.info.subscribe.password);
			}
		}
		$('form[name="ogoneSubscriptionResultForm"] input[name="end_sms"]').attr("checked", false);
		if (subscriptionForm_changed['prefix'] == true) {
			ogoneSubscriptionResultForm_changed['prefix'] = true;
			$('form[name="ogoneSubscriptionResultForm"] input[name="prefix"]').val($('form[name="ogoneSubscriptionForm"] input[name="prefix"]').val());
		}
		if (subscriptionForm_changed['phone'] == true) {
			ogoneSubscriptionResultForm_changed['phone'] = true;
			$('form[name="ogoneSubscriptionResultForm"] input[name="phone"]').val($('form[name="ogoneSubscriptionForm"] input[name="phone"]').val());
		}
		if (subscriptionForm_changed['email'] == true) {
			ogoneSubscriptionResultForm_changed['email'] = true;
			$('form[name="ogoneSubscriptionResultForm"] input[name="email"]').val($('form[name="ogoneSubscriptionForm"] input[name="email"]').val());
		}
		// Fill in logon fields
		$('form[name="logonForm"] input[name="login"]').val($.settings.info.subscribe.login);
		$('form[name="logonForm"] input[name="password"]').val($.settings.info.subscribe.password);
	}

	if (display == true) {
		$('form[name="ogoneSubscriptionResultForm"]').show();
		$('form[name="ogoneSubscriptionForm"]').hide();
	}
	else {
		$('form[name="ogoneSubscriptionForm"]').show();

		if ($.settings.subscribe.ogone.option != undefined) {
			$('#ogoneSubscriptionForm_explain_text').text(getTextTranslation('ogoneOptionSubscriptionForm_explain_text'));
		}

		$('form[name="ogoneSubscriptionResultForm"]').hide();
		ogoneSubscriptionResultForm_empty();
	}
	ogoneSubscriptionResultForm_phoneHelpBlock_display(false);

	if ($.settings.subscribe.ogone.option != undefined) {
		$('#ogoneSubscriptionResultForm_back_button').text(getTextTranslation('ogoneOptionSubscriptionResultForm_back_button'));
	}
}

/** Empty ogoneSubscriptionResultForm
 */
function ogoneSubscriptionResultForm_empty() {
	$('form[name="ogoneSubscriptionResultForm"] input[type="text"]').each(function() {
		$(this).val('');
	});
	$('form[name="ogoneSubscriptionResultForm"] input[type="checkbox"]').each(function() {
		$(this).attr("checked", false);
	});
	$('#ogoneSubscriptionResultForm_result_login_value').html('');
	$('#ogoneSubscriptionResultForm_result_password_value').html('');
	// Adding examples values
	ogoneSubscriptionResultForm_phoneHelpBlock_configure();
	ogoneSubscriptionResultForm_changed['prefix'] = false;
	ogoneSubscriptionResultForm_changed['phone'] = false;
	ogoneSubscriptionResultForm_changed['email'] = false;
}

/** Display ogoneSubscriptionResultForm_send_sms_phone_help_block when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function ogoneSubscriptionResultForm_phoneHelpBlock_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#ogoneSubscriptionResultForm_send_sms_phone_help_block').is(':hidden') == true) {
		display = true;
	}
	if (display == true) {
		$('#ogoneSubscriptionResultForm_send_sms_phone_help_block').show();
	}
	else {
		$('#ogoneSubscriptionResultForm_send_sms_phone_help_block').hide();
	}
}

/** Configure ogoneSubscriptionResultForm_send_sms_phone_help_block
 * @param string displayLang - The language whish to display the content
 */
function ogoneSubscriptionResultForm_phoneHelpBlock_configure(displayLang) {
	if (ogoneSubscriptionResultForm_changed['prefix'] != true) {
		$('#ogoneSubscriptionResultForm_send_sms_phone_prefix_value').val(getInputTranslation("ogoneSubscriptionResultForm_send_sms_phone_prefix_value", displayLang));
	}
	if (ogoneSubscriptionResultForm_changed['phone'] != true) {
		$('#ogoneSubscriptionResultForm_send_sms_phone_phone_value').val(getInputTranslation("ogoneSubscriptionResultForm_send_sms_phone_phone_value", displayLang));
	}
	$('#ogoneSubscriptionResultForm_send_sms_phone_help_prefix_example_value').val(getInputTranslation("ogoneSubscriptionResultForm_send_sms_phone_help_prefix_example_value", displayLang));
	$('#ogoneSubscriptionResultForm_send_sms_phone_help_phone_example_value').val(getInputTranslation("ogoneSubscriptionResultForm_send_sms_phone_help_phone_example_value", displayLang));
}

function ogoneSubscriptionResultFormSend_display(state, mode) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		if (mode == "sms") {
			$('#ogoneSubscriptionResultForm_send_sms_phone_block').show();
		}
		if (mode == "mail") {
			$('#ogoneSubscriptionResultForm_send_email_address_block').show();
		}
		if ($('#ogoneSubscriptionResultForm_send_email_address_block').is(':visible') || $('#ogoneSubscriptionResultForm_send_sms_phone_block').is(':visible')) {
			$('#ogoneSubscriptionResultForm_send_button').show();
		}
	}
	else {
		if (mode == "sms") {
			$('#ogoneSubscriptionResultForm_send_sms_phone_block').hide();
			if ($('#ogoneSubscriptionResultForm_send_email_address_block').length == 0) {
				// Hide if SMS mode only visible on portal
				$('#ogoneSubscriptionResultForm_send_button').hide();
			}
		}
		if (mode == "mail") {
			$('#ogoneSubscriptionResultForm_send_email_address_block').hide();
			if ($('#ogoneSubscriptionResultForm_send_sms_phone_block').length == 0) {
				// Hide if Mail mode only visible on portal
				$('#ogoneSubscriptionResultForm_send_button').hide();
			}
		}
		if ($('#ogoneSubscriptionResultForm_send_email_address_block').is(':hidden') && $('#ogoneSubscriptionResultForm_send_sms_phone_block').is(':hidden')) {
			$('#ogoneSubscriptionResultForm_send_button').hide();
		}
	}
	ogoneSubscriptionResultForm_phoneHelpBlock_display(false);
}

/** Enable waiting mode on ogoneSubscriptionResultForm
 */
function ogoneSubscriptionResultFormWaiting(state) {
	switch (state) {
		case true:
			$('#ogoneSubscriptionResultForm_back_button').attr("disabled", true);
			$('#ogoneSubscriptionResultForm_send_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#ogoneSubscriptionResultForm_back_button').attr("disabled", false);
			$('#ogoneSubscriptionResultForm_send_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

function ogoneSubscriptionResultFormSendCredential() {

	var params = new Object();
	var sendMailOption = $('form[name="ogoneSubscriptionResultForm"] input[name="send_mail"]').is(":checked");
	var sendSmsOption = $('form[name="ogoneSubscriptionResultForm"] input[name="send_sms"]').is(":checked");

	params.login = $('form[name="logonForm"] input[name="login"]').val();
	params.password = $('form[name="logonForm"] input[name="password"]').val();

	params.prefix = (ogoneSubscriptionResultForm_changed['prefix'] == true) ? $('form[name="ogoneSubscriptionResultForm"] input[name="prefix"]').val() : "";
	params.phone = (ogoneSubscriptionResultForm_changed['phone'] == true) ? $('form[name="ogoneSubscriptionResultForm"] input[name="phone"]').val() : "";
	params.email = (ogoneSubscriptionResultForm_changed['email'] == true) ? $('form[name="ogoneSubscriptionResultForm"] input[name="email"]').val() : "";

	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}

	var callbacks = new Object();
	callbacks.beforeSend = function() { ogoneSubscriptionResultFormWaiting(true); };
	callbacks.success    = function() { ogoneSubscriptionResultFormSendCredentialCallback(); };
	callbacks.complete   = function() { ogoneSubscriptionResultFormWaiting(false); };

	if ($.settings.subscribe.ogone.sendMail != undefined && $.settings.subscribe.ogone.sendMail.display == true && sendMailOption) {
		params.action = "ogone_send_mail";
		subscriptionSendCredential(callbacks, params);
	}
	if ($.settings.subscribe.ogone.sendSms != undefined && $.settings.subscribe.ogone.sendSms.display == true && sendSmsOption) {
		params.action = "ogone_send_sms";
		subscriptionSendCredential(callbacks, params);
	}
}

function ogoneSubscriptionResultFormSendCredentialCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		displayStep();
	}
}

/*****************************************************************************/

/** Executed when link is clicked
 */
function ogoneSubscriptionLinkEnable() {

	logonForm_display(false);
	logonFormSubscribeChoice_display(false);
	ogoneSubscriptionForm_display(true);
}

/*****************************************************************************/

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function ogoneSubscriptionResultForm_modifyEvent(type, element) {
	switch (type) {
		case 'focus':
			if (ogoneSubscriptionResultForm_changed[element.attr("name")] != true) {
				element.val("");
			}
			break;

		case 'blur':
			if (element.val() == "") {
				element.val(getInputTranslation(element.attr("id")));
				ogoneSubscriptionResultForm_changed[element.attr("name")] = false;
			}
			else {
				ogoneSubscriptionResultForm_changed[element.attr("name")] = true;
			}
			break;
	}
}


/*****************************************************************************/
/****                ogone Payment Form JavaScript functions             ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
	$('form[name="ogonePaymentForm"] select[name="select_package"]').change(function() {
		ogonePaymentForm_packages_describe();
		ogonePaymentFormPay();
	});
	$('form[name="ogonePaymentForm"] select[name="select_package"]').keyup(function() {
		ogonePaymentForm_packages_describe();
		ogonePaymentFormPay();
	});

	/** Buttons triggers
	 */
	$('#ogonePaymentForm_back_button').click(function() {
		ogonePaymentFormRefillBack();
	});
	$('#ogonePaymentForm_disconnect_button').click(function() {
		ogonePaymentFormBack();
	});
	$('#ogonePaymentForm_pay_button').click(function() {
		ogonePaymentFormPay();
	});
	$('#ogonePaymentResultForm_disconnect_button').click(function() {
		ogonePaymentResultForm_disconnect();
	});
	$('#ogonePaymentResultForm_connect_button').click(function() {
		ogonePaymentResultForm_connect();
	});
	/** Form triggers
	 */
	$('form[name="ogonePaymentForm"]').submit(function() {
		return false;
	});
	$('form[name="ogonePaymentResultForm"]').click(function() {
		return false;
	});
	$('#ogoneRedirectionForm_pay_button').click(function() {
		// Update order status through API
		ogoneRedirectFormPay();
	});
});

/** Configure ogonePaymentForm depending on settings
 */
function ogonePaymentForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.ogone != undefined) {
		// Add packages
		ogonePaymentForm_packages_configure();
	}
	else {
		$('form[name="ogonePaymentForm"]').remove();
		$('form[name="ogonePaymentResultForm"]').remove();
	}
}

function ogonePaymentForm_packages_configure(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.ogone != undefined) {
		var ogoneInfos = null;
		var defaultOptionText;
		if ($.settings.subscribe.ogone.package != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var ogoneInfos = $.settings.subscribe.ogone.package;
			// Keep default option
			defaultOptionText = $('#ogonePaymentForm_default_package_option').text();
		}
		else if ($.settings.subscribe.ogone.option != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			var ogoneInfos = $.settings.subscribe.ogone.option;
			defaultOptionText = getTextTranslation('ogoneOptionPaymentForm_default_package_option');
			$('#ogonePaymentForm_select_package_text').text(getTextTranslation('ogoneOptionPaymentForm_select_package_text'));
			$('#ogonePaymentForm_title_text').text(getTextTranslation('ogoneOptionPaymentForm_title_text'));
			$('#ogonePaymentForm_explain_text').text(getTextTranslation('ogoneOptionPaymentForm_explain_text'));
			$('#ogonePaymentForm_package_description_explain').text(getTextTranslation('ogoneOptionPaymentForm_package_description_explain'));
			$('#ogonePaymentForm_package_description_text').text(getTextTranslation('ogoneOptionPaymentForm_package_description_text'));
		}
		else {
			return;
		}

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}

		// Empty the select list
		$('form[name="ogonePaymentForm"] select[name="select_package"]').empty();
		$('form[name="ogonePaymentForm"] select[name="select_package"]').append('<option id="ogonePaymentForm_default_package_option" disabled selected value="">' + defaultOptionText + '</option>');
		// Populate list
		$(ogoneInfos).each(function () {
			var package = $(this)[0];
			var text;
			var currencyLanguage;
			if (package[displayLang] != undefined) {
				text = package[displayLang].text;
				currencyLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
			}
			else if (package[package.defaultLang] != undefined) {
				text = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
			}
			else {
				text = "";
				currencyLanguage = package.defaultLang;
			}
			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}

			$('form[name="ogonePaymentForm"] select[name="select_package"]').append('<option value="' + package.name + '"' + '>' + text + '</option>');
		});
	}
}

/** Display ogonePaymentForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function ogonePaymentForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "PAYMENT") && ($.settings.type != undefined && $.settings.type == "OGONE") ) {
		display = true;
	}
	if (display == true) {
		if( $.settings.payment.status=="waiting_ogone" || $.settings.payment.status=="verifying"  )
		{
			ogonePaymentForm_display(false);
			if($.settings.payment.status=="verifying")ogonePaymentResultForm_verify();
			if($.settings.payment.status=="waiting_ogone")ogoneSendPaymentForm();
		}
		// otherwise, select package form
		else
		{
			// deal with users already exists otherwise, select package form
			if ($.settings.payment && $.settings.payment.process == 'create' && $.settings.payment.status == 'init' && $.settings.payment.user_exists != undefined && $.settings.payment.user_exists == true) {
				ogonePaymentForm_packages_configure();
				ogonePaymentForm_packages_describe();
			}

			$('form[name="ogonePaymentForm"]').show();

			if ($.settings.payment && $.settings.payment.process == 'refill') {
				$('#ogonePaymentForm_back_button').show();
				$('#ogonePaymentForm_disconnect_button').hide();
			}
			else {
				$('#ogonePaymentForm_disconnect_button').show();
				$('#ogonePaymentForm_back_button').hide();
			}
		}
	}
	else {
		$('form[name="ogonePaymentForm"]').hide();
		$('#ogonePaymentForm_package_description_explain').show();
		$('#ogonePaymentForm_package_description_value').html('');
		ogonePaymentForm_packages_configure();
		ogonePaymentForm_packages_describe();
		$('form[name="ogoneRedirectForm"]').hide();
	}
}

/** Executed when back button is clicked
 */
function ogonePaymentFormBack() {
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { ogonePaymentFormBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	backAction(callbacks);
}

/** Executed on return of ogonePaymentFormBack function
 */
function ogonePaymentFormBackCallback() {

	if ($.settings != undefined && $.settings.payment != undefined) {
		delete $.settings.payment;
		$.settings.payment = new Object();
	}

	displayErrorInfo();
	displayStep();
}

function ogonePaymentFormRefillBack() {
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { ogonePaymentFormRefillBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	backAction(callbacks);
}

function ogonePaymentFormRefillBackCallback() {

	if ($.settings != undefined && $.settings.payment != undefined) {
		delete $.settings.payment;
		$.settings.payment = new Object();
	}

	ogonePaymentForm_display(false);
	accountRefillForm_display(true);
	accountRefillForm_options_configure();
	accountRefillForm_options_describe();
}

/** Enable waiting mode on ogonePaymentForm
 */
function ogonePaymentFormWaiting(state) {
	switch (state) {
		case true:
			$('#ogonePaymentForm_back_button').attr("disabled", true);
			$('#ogonePaymentForm_disconnect_button').attr("disabled", true);
			$('#ogonePaymentForm_pay_button').attr("disabled", true);
			$('#ogonePaymentResultForm_disconnect_button').attr("disabled", true);
			$('#ogonePaymentResultForm_connect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#ogonePaymentForm_back_button').attr("disabled", false);
			$('#ogonePaymentForm_disconnect_button').attr("disabled", false);
			$('#ogonePaymentForm_pay_button').attr("disabled", false);
			$('#ogonePaymentResultForm_disconnect_button').attr("disabled", false);
			$('#ogonePaymentResultForm_connect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when pay button is clicked
 */
function ogonePaymentFormPay() {

	var params = new Object();

	params.package = $('form[name="ogonePaymentForm"] select[name="select_package"]').val();

	if (($.settings.user != undefined) && ($.settings.user.securePwd != undefined)) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	var callbacks = new Object();
	callbacks.beforeSend = function() { ogonePaymentFormWaiting(true); };
	callbacks.success    = function() { ogonePaymentFormPayCallback(); };
	callbacks.complete   = function() { ogonePaymentFormWaiting(false); };
	selectOgonePackage(callbacks, params);
}

/** Executed on return of ogonePaymentFormPay function
 */
function ogonePaymentFormPayCallback() {
	displayErrorInfo();
	if($.settings.error == undefined)
	{
		$('form[name="ogoneRedirectForm"]').show();
	}
	else
	{
		$('form[name="ogoneRedirectForm"]').hide();
	}
}

/* Fill and send Ogone payment infos */

function ogoneSendPaymentForm()
{
	displayWaitingIcon(true);
	$('form[name="ogoneRedirectForm"]').attr('action', $.settings.payment.ogoneUrlPost);
	$('form[name="ogoneRedirectForm"] input[name="PSPID"]').val($.settings.payment.pspid);
	$('form[name="ogoneRedirectForm"] input[name="USERID"]').val($.settings.payment.userid);
	$('form[name="ogoneRedirectForm"] input[name="PSWD"]').val($.settings.payment.userpassword);
	$('form[name="ogoneRedirectForm"] input[name="ORDERID"]').val($.settings.payment.orderid);
	$('form[name="ogoneRedirectForm"] input[name="AMOUNT"]').val($.settings.payment.amount);
	$('form[name="ogoneRedirectForm"] input[name="CURRENCY"]').val($.settings.payment.currency);
	$('form[name="ogoneRedirectForm"] input[name="LANGUAGE"]').val($.settings.payment.language);
	$('form[name="ogoneRedirectForm"] input[name="SHASIGN"]').val($.settings.payment.shasign);
	$('form[name="ogoneRedirectForm"] input[name="ACCEPTURL"]').val($.settings.payment.portal_url);
	$('form[name="ogoneRedirectForm"] input[name="DECLINEURL"]').val($.settings.payment.portal_url);
	$('form[name="ogoneRedirectForm"] input[name="EXCEPTIONURL"]').val($.settings.payment.portal_url);
	$('form[name="ogoneRedirectForm"] input[name="CANCELURL"]').val($.settings.payment.portal_url);
	$('form[name="ogoneRedirectForm"]').submit();
}


/** Executed on return of ogonePaymentFormPay function
 */
function ogoneRedirectFormPayCallback() {

	if ($.settings.error == undefined) {
		ogonePaymentForm_display(false);
		displayStep();
	}
	displayErrorInfo();

}

/** Executed on return of ogonePaymentFormPay function
 */
function ogoneRedirectFormPay()
{
	var params = new Object();
	params.orderid = $('form[name="ogoneRedirectForm"] input[name="ORDERID"]').val();
	params.login = $.settings.payment.login;
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	var callbacks = new Object();
	callbacks.beforeSend = function() { ogonePaymentFormWaiting(true); };
	callbacks.success    = function() { ogoneRedirectFormPayCallback(); };
	callbacks.complete   = function() { ogonePaymentFormWaiting(false); };

	ogoneSubmitPayment(callbacks, params);
}

function ogonePaymentForm_packages_describe(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.ogone != undefined) {
		 var ogoneInfos = null;
		 if ($.settings.subscribe.ogone.package != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			 var ogoneInfos = $.settings.subscribe.ogone.package;
		 }
		 else if ($.settings.subscribe.ogone.option != undefined && ($.settings.payment && $.settings.payment.process == "create")) {
			 var ogoneInfos = $.settings.subscribe.ogone.option;
		 }
		 else {
			 return;
		 }

		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		// Update describe block
		if ($('form[name="ogonePaymentForm"] select[name="select_package"]').val() == "") {
			$('#ogonePaymentForm_package_description_explain').show();
			$('#ogonePaymentForm_package_description_value').html("");
		}
		else {
			$(ogoneInfos).each(function () {
				var package = $(this)[0];
				if (package.name == $('form[name="ogonePaymentForm"] select[name="select_package"]').val()) {
					var describe;
					if (package[displayLang] != undefined) {
						describe = package[displayLang].description;
					}
					else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
						describe = package[$.settings.lang.defaultLang].description;
					}
					else if (package[package.defaultLang] != undefined) {
						describe = package[package.defaultLang].description;
					}

					if (describe == undefined) {
						describe = getTextTranslation('accountRefillForm_no_description');
					}

					$('#ogonePaymentForm_package_description_explain').hide();
					$('#ogonePaymentForm_package_description_value').html(describe);
				}
			});
		}
	}
}

function ogonePaymentForm_options_describe() {

	var displayLang = $.settings.user.lang;
	var ogoneInfos = $.settings.subscribe.ogone.refill;
	var package = null;
	var describe;
	var text;
	var currencyLanguage;
	$('#ogonePaymentForm_select_package_text').text(getTextTranslation('accountRefillForm_option_buyed_text'));
	$('#ogonePaymentForm_title_text').text(getTextTranslation('ogoneOptionPaymentForm_title_text'));
	$('#ogonePaymentForm_explain_text').text(getTextTranslation('ogoneOptionPaymentForm_refill_text'));
	$('#ogonePaymentForm_package_description_explain').text(getTextTranslation('ogoneOptionPaymentForm_package_description_explain'));
	$('#ogonePaymentForm_package_description_text').text(getTextTranslation('ogoneOptionPaymentForm_package_description_text'));

	$(ogoneInfos).each(function () {
		var package = $(this)[0];

		// if (package.name == $('form[name="ogonePaymentForm"] select[name="select_package"]').val()) {
		if (package.name == $.settings.payment.package) {

			if (package[displayLang] != undefined) {
				text             = package[displayLang].text;
				currencyLanguage = displayLang;
				describe         = package[displayLang].description;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text             = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
				describe         = package[$.settings.lang.defaultLang].description;
			}
			else if (package[package.defaultLang] != undefined) {
				text             = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
				describe         = package[package.defaultLang].description;
			}
			else {
				text             = "";
				currencyLanguage = package.defaultLang;
			}

			if (describe == undefined) {
				describe = getTextTranslation('accountRefillForm_no_description');
			}

			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}
			$('#ogonePaymentForm_package_description_explain').hide();
			$('#ogone_select_list').hide();
			$('#ogonePaymentForm_package_description_value').html(describe);
			$('#ogonePaymentForm_payment_detail_value').html(text);
		}
	});

	if($.settings.error == undefined)
	{
		$('form[name="ogoneRedirectForm"]').show();
	}
}

/** Display ogonePaymentResultForm (Usualy Triggered when pay button clicked)
 * @param boolean state - Indicate if the results must be displayed or not
 */
function ogonePaymentResultForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	if (display == true) {
		$('form[name="ogonePaymentResultForm"]').show();
		displayWaitingIcon(false);
		if($.settings.payment.status=="completed")
		{
			displayErrorInfo();
			$("#ogonePaymentResultForm_payment_timer_text").hide();
			if ($.settings.payment.process == "create") {
				$("#ogonePaymentResultForm_connect_button").show();
			}
			else if ($.settings.payment.process == "refill") {
				$('form[name="ogonePaymentForm"]').remove();
				$('form[name="ogonePaymentResultForm"]').remove();
				accountRefillForm_paymentValidate();
			}
			else {
				displayErrorInfo();
				$("#ogonePaymentResultForm_connect_button").hide();
				if ($.settings.user.paymentTimer != undefined && $.settings.user.paymentTimer.value != undefined) {
					$("#ogonePaymentResultForm_payment_timer_text").show();
					$.settings.user.paymentTimer.value = 10;
					ogonePaymentResultForm_payment_timer_start();
				}
			}
		}
	}
	else {
		$('form[name="ogonePaymentResultForm"]').hide();
	}

	if (($.settings.subscribe.ogone.option != undefined) || ($.settings.subscribe.ogone.refill != undefined)){
		$('#ogoneSubscriptionResultForm_back_button').text(getTextTranslation('ogoneOptionSubscriptionResultForm_back_button'));
	}
}

/** Executed when comming back from Ogone paymen website
 */
function ogonePaymentResultForm_verify() {
	if ($.settings.payment != undefined) {
		var params = new Object();
		var callbacks = new Object();
		params.login = $.settings.payment.login;
		params.policyAccept = $.settings.payment.policyAccept;

		callbacks.beforeSend = function() { ogonePaymentFormWaiting(true); };
		callbacks.success    = function() { ogonePaymentResultForm_display(true); };
		callbacks.complete   = function() { ogonePaymentFormWaiting(false); };
		displayWaitingIcon(true);
		verifyPayment(callbacks,params);
	}
	else {

		displayStep();
	}
}


/** Executed when connect button is clicked
 */
function ogonePaymentResultForm_connect() {
	if($.settings.error == undefined)
	{
		// user payed, follow auto connect link
		ogonePaymentResultForm_payment_timer_stop();
		delete $.settings.user.paymentTimer;
		if($.settings.payment.status=="completed")
		{
			ogonePaymentResultForm_display(false);
			window.location = $.settings.payment.a_connect_link;
		}
		else {
			ogonePaymentResultForm_disconnect();
		}
	}
	else
	{
		ogonePaymentResultForm_disconnect();
		displayErrorInfo();
	}
}

/** Executed on return of authenticate shortcut for ogone package choice
 */
function ogonePaymentResultFormConnectCallback() {
	if($.settings.error == undefined)
	{
		// user payed, autoconnect
		ogonePaymentResultForm_payment_timer_stop();
		delete $.settings.user.paymentTimer;
		window.location = $.settings.payment.a_connect_link;
	}
	else
	{
		displayErrorInfo();
	}
}

/** Executed when disconnect button is clicked
 */
function ogonePaymentResultForm_disconnect() {
	ogonePaymentResultForm_payment_timer_stop();
	ogonePaymentResultForm_display(false);
	delete $.settings.user.paymentTimer;
	if($.settings.user.isConnected)
		feedbackFormDisconnect();
	else
		ogonePaymentFormBack();

}


function ogonePaymentResultForm_payment_timer_start() {
	if($.settings.user.paymentTimer != undefined && $.settings.user.paymentTimer.value != undefined) {
			if (timerObj.paymentTimer == undefined) {
				timerObj.paymentTimer = new Array();
				timerObj.paymentTimer.refreshInterval = 1000;
				timerObj.paymentTimer.value = $.settings.user.paymentTimer.value;
				timerObj.paymentTimer.resource = window.setInterval(function() { ogonePaymentResultForm_payment_timer_display();}, timerObj.paymentTimer.refreshInterval);

			}
	}
}


function ogonePaymentResultForm_payment_timer_stop() {
	$('#ogonePaymentResultForm_payment_timer').text('-');
	if (timerObj.paymentTimer != undefined && timerObj.paymentTimer.resource != undefined) {
		window.clearInterval(timerObj.paymentTimer.resource);
		delete timerObj.paymentTimer;
	}
}

function ogonePaymentResultForm_payment_timer_display() {
	if (timerObj.paymentTimer != undefined && timerObj.paymentTimer.value != undefined) {
		timerObj.paymentTimer.value--;
		if (timerObj.paymentTimer.value > 0) {
			var hours = Math.floor(timerObj.paymentTimer.value / 3600);
			var mins = Math.floor((timerObj.paymentTimer.value - (hours * 3600)) / 60);
			var seconds = timerObj.paymentTimer.value - (hours * 3600) - (mins * 60);

			var hours_label = getGenericTranslation('hour', null, (hours > 1));
			var mins_label = getGenericTranslation('minute', null, (mins > 1));
			var seconds_label = getGenericTranslation('second', null, (seconds > 1));

			$('#ogonePaymentResultForm_payment_timer_text').text(getTextTranslation('feedbackForm_automatic_disconnection_text'));

			if( hours > 0 )
			{
				$('#ogonePaymentResultForm_payment_timer_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-with-seconds'), hours, hours_label, mins, mins_label,
												seconds, seconds_label));
			}
			else
			{
				$('#ogonePaymentResultForm_payment_timer_value').text($.sprintf(getGenericTranslation('feedbackForm_time-credit-without-hours'), mins, mins_label, seconds, seconds_label));
			}
		}
		else {
			ogonePaymentResultForm_disconnect();
		}
	}
}


/*****************************************************************************/
/****                 PMS Payment Form JavaScript functions               ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
	$('form[name="pmsPaymentForm"] select[name="select_package"]').change(function() {
		pmsPaymentForm_packages_describe();
	});
	$('form[name="pmsPaymentForm"] select[name="select_package"]').keyup(function() {
		pmsPaymentForm_packages_describe();
	});

	/** Buttons triggers
	 */
	$('#pmsPaymentForm_cancel_button').click(function() {
		pmsPaymentForm_display(false);
		$.settings.step = "FEEDBACK";
		manageAccountForm_display(true);
	});

	$('#pmsPaymentForm_disconnect_button').click(function() {
		pmsPaymentFormBack();
	});
	
	$('#pmsPaymentForm_pay_button').click(function() {
		pmsPaymentFormPay();
	});
	
	/** Form triggers
	 */
	$('form[name="pmsPaymentForm"]').submit(function() {
		return false;
	});
});

/** Configure pmsPaymentForm depending on settings
 */
function pmsPaymentForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.pms != undefined) {
		// Add packages
		pmsPaymentForm_packages_configure();
	}
	else {
		$('form[name="pmsPaymentForm"]').remove();
	}
}


function pmsPaymentForm_packages_configure(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.pms != undefined && $.settings.subscribe.pms.package != undefined) {
		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		// Keep default option
		var defaultOptionText = $('#pmsPaymentForm_default_package_option').text();
		// Empty the select list
		$('form[name="pmsPaymentForm"] select[name="select_package"]').empty();
		$('form[name="pmsPaymentForm"] select[name="select_package"]').append('<option id="pmsPaymentForm_default_package_option" disabled selected value="">' + defaultOptionText + '</option>');
		// Populate list
		var packages = $.settings.subscribe.pms.package;
		$(packages).each(function () {
			var package = $(this)[0];
			var text;
			var currencyLanguage;
			if (package[displayLang] != undefined) {
				text = package[displayLang].text;
				currencyLanguage = displayLang;
			}
			else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
				text = package[$.settings.lang.defaultLang].text;
				currencyLanguage = $.settings.lang.defaultLang;
			}
			else {
				text = package[package.defaultLang].text;
				currencyLanguage = package.defaultLang;
			}
			// Add price
			if (package['currency'] == "free") {
				text += "&nbsp;" + "(" + getGenericTranslation('free_package', currencyLanguage) + ")";
			}
			else {
				text += "&nbsp;" + "(" + package['price'] + "&nbsp;" + package['currency'] + ")";
			}
			$('form[name="pmsPaymentForm"] select[name="select_package"]').append('<option value="' + package.name + '">' + text + '</option>');
		});
	}
}

/** Display pmsPaymentForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function pmsPaymentForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "PAYMENT") && ($.settings.type != undefined && $.settings.type == "PMS") ) {
		display = true;
	}
	
	if (display == true) {
		$('form[name="pmsPaymentForm"]').show();
		if ( ($.settings.user.allowmodifypackage == true ) && (switch_package == true) ){
			pmsPaymentForm_cancel_button_show_hide(true);

		}else{
			pmsPaymentForm_cancel_button_show_hide(false);
		}
	}
	else {
		$('form[name="pmsPaymentForm"]').hide();
		pmsPaymentForm_packages_configure();
		pmsPaymentForm_packages_describe();
	}
}

/** Executed when back button is clicked
 */
function pmsPaymentFormBack() {
	
	var callbacks = new Object();
	// callbacks.beforeSend = function() {}; // TODO
	callbacks.success    = function() { pmsPaymentFormBackCallback(); };
	// callbacks.complete   = function() {}; // TODO
	
	backAction(callbacks);
}

/** Executed on return of pmsPaymentFormBack function
 */
function pmsPaymentFormBackCallback() {

	displayErrorInfo();
	displayStep();
}

function pmsPaymentForm_cancel_button_show_hide(state) {
	switch (state) {
		case true:
			$('#pmsPaymentForm_cancel_button').show();
			$('#pmsPaymentForm_disconnect_button').hide();
			$('#pmsPaymentForm_caution_block').show();
			break;
		case false:
			$('#pmsPaymentForm_cancel_button').hide();
			$('#pmsPaymentForm_disconnect_button').show();
			$('#pmsPaymentForm_caution_block').hide();
			break;
	}
}

/** Enable waiting mode on pmsPaymentForm
 */
function pmsPaymentFormWaiting(state) {
	switch (state) {
		case true:
			$('#pmsPaymentForm_disconnect_button').attr("disabled", true);
			$('#pmsPaymentForm_pay_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#pmsPaymentForm_disconnect_button').attr("disabled", false);
			$('#pmsPaymentForm_pay_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}


/** Executed when pay button is clicked
 */
function pmsPaymentFormPay() {

	var params = new Object();
	params.package = $('form[name="pmsPaymentForm"] select[name="select_package"]').val();
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	var callbacks = new Object();
	callbacks.beforeSend = function() { pmsPaymentFormWaiting(true); };
	callbacks.success    = function() { pmsPaymentFormPayCallback(); };
	callbacks.complete   = function() { pmsPaymentFormWaiting(false); };

	selectPmsPackage(callbacks, params);
}

/** Executed on return of pmsPaymentFormPay function
 */
function pmsPaymentFormPayCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		if ($.settings.payment != undefined) {
			var params = new Object();
			params.login = $.settings.payment.login;
			params.policyAccept = $.settings.payment.policyAccept;

			if ( ($.settings.user.allowmodifypackage != undefined) && ($.settings.user.allowmodifypackage == true) && (switch_package == true) ){
				params.currentProfile = $.settings.payment.currentProfile;
				params.lastProfile = $.settings.payment.lastProfile;
				params.switchPackage = switch_package;
			}

			if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
				params.securePwd = $.settings.user.securePwd.value;
			}

			var callbacks = new Object();
			callbacks.beforeSend = function() { pmsPaymentFormWaiting(true); };
			callbacks.success    = function() { pmsPaymentFormConnectCallback(); };
			callbacks.complete   = function() { pmsPaymentFormWaiting(false); };
			authenticate(callbacks , params)
		}
		else {
			displayStep();
		}
	}
}

/** Executed on return of authenticate shortcut for PMS package choice
 */
function pmsPaymentFormConnectCallback() {
	switch_package = false;
	if ($.settings.error == undefined) {
		logonFormConnectCallback();
	}
	else {
		$.settings.step = "LOGON";
		displayErrorInfo();
		displayStep();
	}
}

function pmsPaymentForm_packages_describe(displayLang) {

	if ($.settings.subscribe != undefined && $.settings.subscribe.pms != undefined && $.settings.subscribe.pms.package != undefined) {
		if (displayLang == undefined) { // No displayLang given, find user selected language, else default portal language else default package language
			if ($.settings != undefined && $.settings.user != undefined && $.settings.user.lang != undefined) {
				displayLang = $.settings.user.lang;
			}
		}
		// Update describe block
		if ($('form[name="pmsPaymentForm"] select[name="select_package"]').val() == "") {
			$('#pmsPaymentForm_package_description_explain').show();
			$('#pmsPaymentForm_package_description_value').html("");
		}
		else {
			var packages = $.settings.subscribe.pms.package;
			$(packages).each(function () {
				var package = $(this)[0];
				if (package.name == $('form[name="pmsPaymentForm"] select[name="select_package"]').val()) {
					var describe;
					if (package[displayLang] != undefined) {
						describe = package[displayLang].description;
					}
					else if ($.settings != undefined && $.settings.lang != undefined && $.settings.lang.defaultLang != undefined && package[$.settings.lang.defaultLang] != undefined) {
						describe = package[$.settings.lang.defaultLang].description;
					}
					else {
						describe = package[package.defaultLang].description;
					}
					$('#pmsPaymentForm_package_description_explain').hide();
					$('#pmsPaymentForm_package_description_value').html(describe);
				}
			});
		}
	}
}

/*****************************************************************************/
/****              PPS Subscription Form JavaScript functions             ****/
/*****************************************************************************/

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {

	/** Inputs triggers
	 */
// 	$('form[name=ppsSubscriptionForm] input[name=scratch_code]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=ppsSubscriptionForm] input[name=captcha_code]').change(function() {
// 		///
// 	});
// 	
// 	$('form[name=ppsSubscriptionForm] input[name=policy_accept]').change(function() {
// 		///
// 	});
	
	/** Buttons triggers
	 */
	$('#ppsSubscriptionForm_connect_button').click(function() {
		ppsSubscriptionFormSubscribe();
	});
	
	/** Form triggers
	 */
	$('form[name="ppsSubscriptionForm"]').submit(function() {
		return false;
	});
});


/** Configure ppsSubscriptionForm depending on settings
 */
function ppsSubscriptionForm_configure() {

	// Configure display
	if ($.settings.subscribe != undefined && $.settings.subscribe.pps != undefined) {
		// Add captcha source to avoid generating this if PPS mode not enable
		$('#ppsSubscriptionForm_captcha_code_img').attr("src", "/_INC/gen_random_img.php?#");
		$('#ppsSubscriptionForm_captcha_code_img').fadeIn();
		
		if ($.settings.subscribe.pps.policy != undefined && $.settings.subscribe.pps.policy.display == true) {
			ppsSubscriptionForm_policy_configure();
		}
		else {
			$('#ppsSubscriptionForm_policy_block').remove();
		}
	}
	else {
		$('form[name="ppsSubscriptionForm"]').remove();
	}
}

/** Configure ppsSubscriptionForm_policy_block
 * @param string lang - The language whish to display the policy
 */
function ppsSubscriptionForm_policy_configure(displayLang) {
	
	if ($.settings.subscribe != undefined && $.settings.subscribe.pps != undefined && $.settings.subscribe.pps.policy != undefined) {
		var policy = extractPolicyText($.settings.subscribe.pps, displayLang);
		$('#ppsSubscriptionForm_policy_text').html(policy);
	}
	/* TODO configure back_action portal_api call and add GUI in template html if we need support other portals when PPS is set */ 
}

/** Display ppsSubscriptionForm depending on settings
 * Can be overwritten by state
 * @param boolean state - Indicate if the form must be displayed or not
 */
function ppsSubscriptionForm_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ( ($.settings.step != undefined && $.settings.step == "SUBSCRIBE") && ($.settings.type != undefined && $.settings.type == "PPS") ) {
		display = true;
	}
	
	if (display == true) {
		$('form[name="ppsSubscriptionForm"]').show();
	}
	else {
		$('form[name="ppsSubscriptionForm"]').hide();
		ppsSubscriptionForm_empty();
	}
}

/** Empty ppsSubscriptionForm
 */
function ppsSubscriptionForm_empty() {
	$('form[name="ppsSubscriptionForm"] input[type="text"]').each(function() {
		$(this).val('');
	});
	$('form[name="ppsSubscriptionForm"] input[type="checkbox"]').each(function() {
		$(this).attr("checked", false);
	});
}

/** Enable waiting mode on ppsSubscriptionForm
 */
function ppsSubscriptionFormWaiting(state) {
	switch (state) {
		case true:
			$('#ppsSubscriptionForm_connect_button').attr("disabled", true);
			$('body').toggleClass("cursor-wait");
			break;
		case false:
			$('#ppsSubscriptionForm_connect_button').attr("disabled", false);
			$('body').toggleClass("cursor-wait");
			break;
	}
}

/** Executed when button is clicked
 */
function ppsSubscriptionFormSubscribe() {

	var params = new Object();
	// Mandatory parameters
	params.type = "pps";
	params.scratchCode = $('form[name="ppsSubscriptionForm"] input[name="scratch_code"]').val();
	params.captchaCode = $('form[name="ppsSubscriptionForm"] input[name="captcha_code"]').val();
	params.policyAccept = $('form[name="ppsSubscriptionForm"] input[name="policy_accept"]').is(':checked');
	
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	
	var callbacks = new Object();
	callbacks.beforeSend = function() { ppsSubscriptionFormWaiting(true); };
	callbacks.success    = function() { ppsSubscriptionFormSubscribeCallback(); };
	callbacks.complete   = function() { ppsSubscriptionFormWaiting(false); };
	
	subscribe(callbacks, params);
}

/** Executed on return of ppsSubscriptionFormSubscribe function
 */
function ppsSubscriptionFormSubscribeCallback() {

	displayErrorInfo();
	if ($.settings.error == undefined) {
		var params = new Object();
		params.login = $.settings.user.login;
		params.password = $.settings.user.password;
		params.policyAccept = $('form[name="ppsSubscriptionForm"] input[name="policy_accept"]').is(':checked');
		
		if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
			params.securePwd = $.settings.user.securePwd.value;
		}
		
		// We authenticate the user
		var callbacks = new Object();
		callbacks.beforeSend = function() { ppsSubscriptionFormWaiting(true); };
		callbacks.success    = function() { ppsSubscriptionFormConnectCallback(); };
		callbacks.complete   = function() { ppsSubscriptionFormWaiting(false); };
		
		authenticate(callbacks, params);
	}
}

/** Executed on ppsSubscriptionFormSubscribeCallback function
 */
function ppsSubscriptionFormConnectCallback() {
	
	displayErrorInfo();
	if ($.settings.error == undefined) {
		displayStep();
		
		if ($.settings.step == "FEEDBACK") {
			// We must refresh the user connection
			refreshObj.login = $.settings.user.login.value;
			refreshObj.refreshInterval = ($.settings.refreshInterval == undefined) ? 50000 : $.settings.refreshInterval;
			
			if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
				refreshObj.securePwd = $.settings.user.securePwd.value;
			}
			startRefresh();
		}
	}
}


/*****************************************************************************/
/****			 Subscription Form JavaScript functions			   ****/
/*****************************************************************************/

/** Listen to modified element
 */
var subscriptionForm_changed = new Object();

/** This function is triggered when the page is loaded
 */
$(document).ready(function() {
	$('#common_subscription_fields').prependTo('#reserved_block');
	$('#common_subscription_fields').hide();

	$('#subscriptionForm_phone_prefix_value').focus(function() {
		subscriptionForm_modifyEvent('focus', $(this));
		subscriptionForm_phoneHelpBlock_display(true);
	});

	$('#subscriptionForm_phone_prefix_value').blur(function() {
		subscriptionForm_modifyEvent('blur', $(this));
	});

	$('#subscriptionForm_phone_phone_value').focus(function() {
		subscriptionForm_modifyEvent('focus', $(this));
		subscriptionForm_phoneHelpBlock_display(true);
	});

	$('#subscriptionForm_phone_phone_value').blur(function() {
		subscriptionForm_modifyEvent('blur', $(this));
	});

	$('#subscriptionForm_phone_help_link').click(function() {
		subscriptionForm_phoneHelpBlock_display();
	});
});

/** Configure subscriptionForm common fields depending on settings
 */
function subscriptionForm_configure(mode) {
	var subscription_mode = null;
	var empty_form = true;
	try {
		subscription_mode = eval('$.settings.subscribe.' + mode);
	}
	catch(ex) {
		subscription_mode = null;
	}

	if (subscription_mode == undefined || subscription_mode == null) {
		return;
	}
	// Configure login
	if (subscription_mode.userLogin != undefined && subscription_mode.userLogin.display == true) {
		empty_form = false;
		if (subscription_mode.userLogin.mandatory != true) {
			$('#subscriptionForm_user_login_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_user_login_block').hide();
	}

	// Configure password
	if (subscription_mode.userPassword != undefined && subscription_mode.userPassword.display == true) {
		empty_form = false;
		if (subscription_mode.userPassword.mandatory != true) {
			$('#subscriptionForm_user_password_state').css("visibility", "hidden");
			$('#subscriptionForm_user_password_confirm_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_user_password_block').hide();
		$('#subscriptionForm_user_password_confirm_block').hide();
	}

	// Configure last name
	if (subscription_mode.lastName != undefined && subscription_mode.lastName.display == true) {
		empty_form = false;
		if (subscription_mode.lastName.mandatory != true) {
			$('#subscriptionForm_last_name_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_last_name_block').remove();
	}

	// Configure first name
	if (subscription_mode.firstName != undefined && subscription_mode.firstName.display == true) {
		empty_form = false;
		if (subscription_mode.firstName.mandatory != true) {
			$('#subscriptionForm_first_name_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_first_name_block').remove();
	}

	// Configure gender
	if (subscription_mode.gender != undefined && subscription_mode.gender.display == true) {
		empty_form = false;
		if (subscription_mode.gender.mandatory != true) {
			$('#subscriptionForm_gender_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_gender_block').remove();
	}

	// Configure birth date
	if (subscription_mode.birthDate != undefined && subscription_mode.birthDate.display == true) {
		empty_form = false;
		if (subscription_mode.birthDate.mandatory != true) {
			$('#subscriptionForm_birth_date_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_birth_date_block').remove();
	}

	// Configure user languages
	if (subscription_mode.userLanguage != undefined && subscription_mode.userLanguage.display == true) {
		empty_form = false;
		if (subscription_mode.userLanguage.mandatory != true) {
			$('#subscriptionForm_user_language_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_user_language_block').remove();
	}

	// Configure interests
	if (subscription_mode.interests != undefined && subscription_mode.interests.display == true) {
		empty_form = false;
		if (subscription_mode.interests.mandatory != true) {
			$('#subscriptionForm_interests_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_interests_block').remove();
	}

	// Configure email
	if (subscription_mode.email != undefined && subscription_mode.email.display == true) {
		empty_form = false;
		if (subscription_mode.mandatory != true) {
			$('#subscriptionForm_email_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_email_block').hide();
	}

	// Configure phone
	if (subscription_mode.phone != undefined && subscription_mode.phone.display == true) {
		empty_form = false;
		if (subscription_mode.phone.mandatory != true) {
			$('#subscriptionForm_phone_state').css("visibility", "hidden");
		}
		// Configure help block
		subscriptionForm_phoneHelpBlock_configure();
	}
	else {
		$('#subscriptionForm_phone_block').hide();
		$('#subscriptionForm_phone_help_block').hide();
	}

	// Configure Organizational unit name
	if (subscription_mode.organizationalUnitName != undefined && subscription_mode.organizationalUnitName.display == true) {
		empty_form = false;
		if (subscription_mode.organizationalUnitName.mandatory != true) {
			$('#subscriptionForm_organizational_unit_name_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_organizational_unit_name_block').remove();
	}

	// Configure Postal address
	if (subscription_mode.postalAddress != undefined && subscription_mode.postalAddress.display == true) {
		empty_form = false;
		if (subscription_mode.postalAddress.mandatory != true) {
			$('#subscriptionForm_postal_address_state').css("visibility", "hidden");
			$('#subscriptionForm_postal_code_state').css("visibility", "hidden");
			$('#subscriptionForm_postal_locality_name_state').css("visibility", "hidden");
			$('#subscriptionForm_postal_country_name_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_postal_address_block').remove();
	}

	// Configure personal fields
	if (subscription_mode.personalField_1 != undefined && subscription_mode.personalField_1.display == true) {
		empty_form = false;
		if (subscription_mode.personalField_1.mandatory != true) {
			$('#subscriptionForm_personal_field_1_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_personal_field_1_block').remove();
	}
	if (subscription_mode.personalField_2 != undefined && subscription_mode.personalField_2.display == true) {
		empty_form = false;
		if (subscription_mode.personalField_2.mandatory != true) {
			$('#subscriptionForm_personal_field_2_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_personal_field_2_block').remove();
	}
	if (subscription_mode.personalField_3 != undefined && subscription_mode.personalField_3.display == true) {
		empty_form = false;
		if (subscription_mode.personalField_3.mandatory != true) {
			$('#subscriptionForm_personal_field_3_state').css("visibility", "hidden");
		}
	}
	else {
		$('#subscriptionForm_personal_field_3_block').remove();
	}

	// Configure sponsoring
	if (subscription_mode.sponsoringEnable == undefined || subscription_mode.sponsoringEnable != true) {
		$('#subscriptionForm_sponsor_email_block').hide();
		$('#' + mode + 'SubscriptionForm_explain_sponsoring_text').hide();
	}

	// Configure mandatary hint display
	if (empty_form == true) { $("#subscriptionForm_fields_state_text").hide(); }
}

function subscriptionForm_customFields_configure(displayLang, mode) {
	var subscription_mode = null;
	try{
		subscription_mode = eval('$.settings.subscribe.' + mode);
	}
	catch(ex) {
		subscription_mode = null;
	}
	if(subscription_mode == undefined || subscription_mode == null) {
		return;
	}
	var field_names = new Array("personalField_1", "personalField_2", "personalField_3");
	var itt = 1;

	if(displayLang == undefined || displayLang == null) {
		displayLang = getUserLanguage_default();
	}

	for (key in field_names) {
		var field_name = field_names[key];
		if (subscription_mode[field_name] != undefined && subscription_mode[field_name].display == true) {
			if (subscription_mode[field_name].labels[displayLang] != undefined) {
				$("#subscriptionForm_personal_field_" + itt + "_text").html(subscription_mode[field_name].labels[displayLang]);
			}
			else if (subscription_mode[field_name].labels[$.settings.lang.defaultLang] != undefined) {
				$("#subscriptionForm_personal_field_" + itt + "_text").html(subscription_mode[field_name].labels[$.settings.lang.defaultLang]);
			}
			else {
				$("#subscriptionForm_personal_field_" + itt + "_text").html(subscription_mode[field_name].labels[$.settings.lang.customFieldsDefaultLang]);
			}
		}
		itt++;
	}
}

/** Empty subscriptionForm
 */
function subscriptionForm_empty(mode) {
	if(mode == undefined || mode == null) {
		return;
	}

	$('form[name="' + mode + 'SubscriptionForm"] input[type="text"]').each(function() {
		$(this).val('');
	});
	$('form[name="' + mode + 'SubscriptionForm"] input[type="password"]').each(function() {
		$(this).val('');
	});
	$('form[name="' + mode + 'SubscriptionForm"] input[type="checkbox"]').each(function() {
		$(this).attr("checked", false);
	});
	$('form[name="' + mode + 'SubscriptionForm"] input[type="radio"]').each(function() {
		$(this).attr("checked", false);
	});
	$('form[name="' + mode + 'SubscriptionForm"] select > option').each(function() {
		$(this).attr("selected", false);
	});
	// Adding examples values
	subscriptionForm_phoneHelpBlock_configure();

	subscriptionForm_changed['prefix'] = false;
	subscriptionForm_changed['phone'] = false;
	subscriptionForm_changed['email'] = false;
}

/** Display subscriptionForm_phone_help_block when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function subscriptionForm_phoneHelpBlock_display(state) {

	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#subscriptionForm_phone_help_block').is(':hidden') == true) {
		display = true;
	}

	if (display == true) {
		$('#subscriptionForm_phone_help_block').show();
	}
	else {
		$('#subscriptionForm_phone_help_block').hide();
	}
}

/*****************************************************************************/

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function subscriptionForm_modifyEvent(type, element) {
	switch (type) {
	case 'focus':
		if (subscriptionForm_changed[element.attr("name")] != true) {
			element.val("");
		}
		break;

	case 'blur':
		if (element.val() == "") {
			element.val(getInputTranslation(element.attr("id")));
			subscriptionForm_changed[element.attr("name")] = false;
		}
		else {
			subscriptionForm_changed[element.attr("name")] = true;
		}
		break;
	}
}

/** Display subscriptionForm_passwordHelpBlock_display when help link is clicked
 * @param boolean state - Indicate if the block must be displayed or not
 */
function subscriptionForm_passwordHelpBlock_display(state, displayLang, mode) {
	var display = false;
	if ( (state == true) || (state == false) ) {
		display = state;
	}
	else if ($('#subscriptionForm_password_help_block').is(':hidden') == true) {
		display = true;
	}

	if (display == true) {
		if (translationsAreLoaded == true)
		{
			subscriptionForm_passwordHelpBlock_configure(displayLang, mode);
		}
		$('#subscriptionForm_password_help_block').show();
	}
	else {
		$('#subscriptionForm_password_help_block').hide();
	}
}

/** Configure subscriptionForm_password_help_block
 * @param string displayLang - The language whish to display the content
 */
function subscriptionForm_passwordHelpBlock_configure(displayLang, mode) {
	var pwdConstraint = null;
	try {
		pwdConstraint = eval('$.settings.subscribe.' + mode + '.pwdConstraint');
	}
	catch(ex) {
		pwdConstraint = null;
	}
	if (pwdConstraint != undefined && pwdConstraint != null)  {
		if ($('#subscriptionForm_password_help_list').children().length > 1) {
			$('#subscriptionForm_password_help_list li').not(":first").remove();
		}
		/* Update the content of the help box to display to the user the password policy in use for his profile */
		if(displayLang == undefined || displayLang == null) {
			displayLang = getUserLanguage_default();
		}
		var constraintValues = new Array("minLength", "maxLength");
		for (key in constraintValues) {
			var val = constraintValues[key];
			var line = $('#subscriptionForm_password_help_list li:first').clone();
			line.toggle();
			line.text($.sprintf(getInputTranslation("subscriptionForm_password_help_" + val, displayLang), pwdConstraint.value[val]));
			$('#subscriptionForm_password_help_list').append(line);
		}
		for (key in pwdConstraint.value.characterSet) {
			var set = pwdConstraint.value.characterSet[key];
			if (set.quota > 0) {
				var line = $('#subscriptionForm_password_help_list li:first').clone();
				line.toggle();
				line.text($.sprintf(getInputTranslation("subscriptionForm_password_help_character_set_text", displayLang), set.quota, set.set.join("")));
				$('#subscriptionForm_password_help_list').append(line);
			}
		}
	}
}

function subscriptionForm_commonFields_display(mode) {
	if(mode == undefined || mode == null || mode == '') {
		return;
	}
	// Global
	$('#common_subscription_fields').prependTo('#' + mode + '_common_subscription_fields');
	$('#common_subscription_fields').show();

	// Login in case of sms mode or mail mode
	var login = null;
	try {
		login = eval('$.settings.subscribe.' + mode + '.userLogin');
	}
	catch(ex) {
		login = null;
	}
	if(mode == 'sms' || mode == 'mail' || login == null || !login.display) {
		$('#subscriptionForm_user_login_block').hide();
	}
	else {
		$('#subscriptionForm_user_login_block').show();
		$('#subscriptionForm_user_login_state').css("visibility", login.mandatory ? "visible" : "hidden");
	}

	// Password
	var pwd = null;
	try {
		pwd = eval('$.settings.subscribe.' + mode + '.userPassword');
	}
	catch(ex) {
		pwd = null;
	}
	if(mode != 'mail' && mode != 'sms' && mode != 'print' && pwd != null && pwd.display == true) {
		$('#subscriptionForm_user_password_block').show();
		$('#subscriptionForm_user_password_confirm_block').show();
		$('#subscriptionForm_user_password_state').css("visibility", pwd.mandatory ? "visible" : "hidden");
		$('#subscriptionForm_user_password_confirm_state').css("visibility", pwd.mandatory ? "visible" : "hidden");
	}
	else {
		$('#subscriptionForm_user_password_block').hide();
		$('#subscriptionForm_user_password_confirm_block').hide();
	}

	// Password help link
	var pwdConstraint = null;
	try {
		pwdConstraint = eval('$.settings.subscribe.' + mode + '.pwdConstraint');
	}
	catch(ex) {
		pwdConstraint = null;
	}
	if(pwdConstraint == undefined || pwdConstraint == null) {
		$('#subscriptionForm_password_help_link').hide();
	}
	else {
		$('#subscriptionForm_password_help_link').show();
		$('#subscriptionForm_password_help_link').unbind('click').click(function() {
			subscriptionForm_passwordHelpBlock_display(undefined, undefined, mode);
		});
	}

	// Email in case of mail mode
	var email = null;
	try {
		email = eval('$.settings.subscribe.' + mode + '.email');
	}
	catch(ex) {
		email = null;
	}
	if(mode == 'mail') {
		$('#subscriptionForm_email_block').show();
		$('#subscriptionForm_email_state').css("visibility", "visible");
	}
	else if(email != null && email.display == true) {
		$('#subscriptionForm_email_block').show();
		$('#subscriptionForm_email_state').css("visibility", email.mandatory ? "visible" : "hidden");
	}
	else {
		$('#subscriptionForm_email_block').hide();
	}

	// Phone in case of sms mode
	var phone = null;
	try {
		phone = eval('$.settings.subscribe.' + mode + '.phone');
	}
	catch(ex) {
		phone = null;
	}
	if(mode == 'sms') {
		$('#subscriptionForm_phone_block').show();
		$('#subscriptionForm_phone_help_block').show();
		$('#subscriptionForm_phone_state').css("visibility", "visible");
	}
	else if(phone != null && phone.display == true) {
		$('#subscriptionForm_phone_block').show();
		$('#subscriptionForm_phone_help_block').show();
		$('#subscriptionForm_phone_state').css("visibility", phone.mandatory ? "visible" : "hidden");
	}
	else {
		$('#subscriptionForm_phone_block').hide();
		$('#subscriptionForm_phone_help_block').hide();
	}

	// Custom fields
	subscriptionForm_customFields_configure(undefined, mode);

	// Policy
	var policy = eval('$.settings.subscribe.' + mode + '.policy');
	if(policy == undefined || policy == null || !policy.display) {
		$('#subscriptionForm_policy_block').hide();
	}
	else {
		$('#subscriptionForm_policy_block').show();
		subscriptionForm_policy_configure(undefined, mode);
	}

	// Sponsoring
	var sponsoringEnable = null;
	try {
		sponsoringEnable = eval('$.settings.subscribe.' + mode + '.sponsoringEnable');
	}
	catch(ex) {
		sponsoringEnable = null;
	}
	if(sponsoringEnable == undefined || sponsoringEnable == null || !sponsoringEnable) {
		$('#subscriptionForm_sponsor_email_block').hide();
		$('#' + mode + 'SubscriptionForm_explain_sponsoring_text').hide();
	}
	else {
		$('#subscriptionForm_sponsor_email_block').show();
		$('#' + mode + 'SubscriptionForm_explain_sponsoring_text').show();
	}
}

function subscriptionForm_policy_configure(displayLang, mode) {
	var policy = null;
	try {
		policy = eval('$.settings.subscribe.' + mode + '.policy');
	}
	catch(ex) {
		policy = null;
	}
	if (policy == undefined || policy == null) {
		return;
	}
	var policyWrapper = new Object();
	policyWrapper.policy = policy;
	if(displayLang == undefined || displayLang == null) {
		displayLang = getUserLanguage_default();
	}
	$('#subscriptionForm_policy_text').html(extractPolicyText(policyWrapper, displayLang));
}

/** Manage the modification of inputs and the help texts present on them
 * @param string type - The type on the event (focus | blur )
 * @param element element - The DOM element afected by the modification
 */
function subscriptionForm_modifyEvent(type, element) {
	switch (type) {
	case 'focus':
		if (subscriptionForm_changed[element.attr("name")] != true) {
			element.val("");
		}
		break;

	case 'blur':
		if (element.val() == "") {
			element.val(getInputTranslation(element.attr("id")));
			subscriptionForm_changed[element.attr("name")] = false;
		}
		else {
			subscriptionForm_changed[element.attr("name")] = true;
		}
		break;
	}
}

/** Configure subscriptionForm_phone_block
 * @param string displayLang - The language whish to display the content
 */
function subscriptionForm_phoneHelpBlock_configure(displayLang) {
	if (subscriptionForm_changed['prefix'] != true) {
		$('#subscriptionForm_phone_prefix_value').val(getInputTranslation("subscriptionForm_phone_prefix_value", displayLang));
	}
	if (subscriptionForm_changed['phone'] != true) {
		$('#subscriptionForm_phone_phone_value').val(getInputTranslation("subscriptionForm_phone_phone_value", displayLang));
	}
	$('#subscriptionForm_phone_help_prefix_example_value').val(getInputTranslation("subscriptionForm_phone_help_prefix_example_value", displayLang));
	$('#subscriptionForm_phone_help_phone_example_value').val(getInputTranslation("subscriptionForm_phone_help_phone_example_value", displayLang));
}

function subscriptionFormSubscribe(mode) {
	var params = new Object();
	if(mode == undefined || mode == null) {
		return params;
	}
	// Mandatory parameters
	params.type = mode;
	// don't send login and password if one-click mode doesn't allow their input
	var send_original_form_login = true, send_original_form_passwd = true;
	if (mode == 'one') {
		/*
		// another way to get informationi without try-catch and eval (less reliable)
		if (!$('#subscriptionForm_user_login_block').is(":visible")) {
		send_original_form_login = false;
		}
		if (!$('#subscriptionForm_user_password_block').is(":visible")) {
		send_original_form_passwd = false;
		}
		*/
		var subscription_mode_one = null;
		try {
			subscription_mode_one = eval('$.settings.subscribe.one');
		}
		catch (excep) {
			subscription_mode_one = null;
		}
		if (subscription_mode_one != null) {
			if (subscription_mode_one.userLogin == undefined || subscription_mode_one.userLogin.display === false) {
				send_original_form_login = false;
			}
			if (subscription_mode_one.userPassword == undefined || subscription_mode_one.userPassword.display === false) {
				send_original_form_passwd = false;
			}
		}
	}
	params.login = (send_original_form_login ? $('#subscriptionForm_user_login').val() : '');
	params.password = (send_original_form_passwd ? $('#subscriptionForm_user_password').val() : '');
	params.passwordConfirm = (send_original_form_passwd ? $('#subscriptionForm_user_password_confirm').val() : '');
	params.lastName = $('#subscriptionForm_last_name').val();
	params.firstName = $('#subscriptionForm_first_name').val();
	params.emailAddress = $('#subscriptionForm_email').val();
	params.prefix = (subscriptionForm_changed['prefix'] == true) ? $('#subscriptionForm_phone_prefix_value').val() : "";
	params.phone = (subscriptionForm_changed['phone'] == true) ? $('#subscriptionForm_phone_phone_value').val() : "";
	params.organizationalUnitName = $('#subscriptionForm_organizational_unit_name').val();
	params.postalAddress = $('#subscriptionForm_postal_address').val();
	params.postalCode = $('#subscriptionForm_postal_code').val();
	params.postalLocalityName = $('#subscriptionForm_postal_locality_name').val();
	params.postalPostofficeBox = $('#subscriptionForm_postal_postoffice_box').val();
	params.postalStateOrProvinceName = $('#subscriptionForm_postal_state_or_province_name').val();
	params.postalCountryName = $('#subscriptionForm_postal_country_name').val();
	params.gender = $('#subscriptionForm_gender_m').is(':checked') ? $('#subscriptionForm_gender_m').val() : $('#subscriptionForm_gender_f').is(':checked') ? $('#subscriptionForm_gender_f').val() : "";
	params.birthDate = $('#subscriptionForm_birth_date').val();
	params.userLanguage = $('#subscriptionForm_user_language').val();
	params.interests = ($('#subscriptionForm_interests').val() != null) ? $('#subscriptionForm_interests').val() : "";

	//Custom fields
	params.personalField_1 = ($('#subscriptionForm_personal_field_1').val() != "") ? $('#subscriptionForm_personal_field_1').val() : undefined;
	params.personalField_2 = ($('#subscriptionForm_personal_field_2').val() != "") ? $('#subscriptionForm_personal_field_2').val() : undefined;
	params.personalField_3 = ($('#subscriptionForm_personal_field_3').val() != "") ? $('#subscriptionForm_personal_field_3').val() : undefined;

	// Sponsoring
	params.sponsorEmail = ($('#subscriptionForm_sponsor_email').val() != "") ? $('#subscriptionForm_sponsor_email').val() : undefined;

	params.policyAccept = $('#subscriptionForm_policy_accept').is(':checked');
	if ( ($.settings.user != undefined) && ($.settings.user.securePwd != undefined) ) {
		params.securePwd = $.settings.user.securePwd.value;
	}
	return params;
}

function getUserLanguage_default() {
	var userLang = eval('$.settings.user.lang');
	if(userLang != null && userLang != undefined) {
		return userLang;
	}
	var defaultLang = eval('$.settings.lang.defaultLang');
	if(defaultLang != null && defaultLang != undefined) {
		return defaultLang;
	}
}
