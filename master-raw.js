"use strict";

let pushalertbyiw;
let imgKaren = "https://files.akmosplay.com.br/data/shop/karen1.png";

function rating(nota) {
	$.ajax({
		url: "/master/cadastros/rating",
		data: {
			idCadastro: CADASTROID,
			pagina: ROTA,
			nota: nota,
		},
		type: "POST",
		success: function (response) {
			if (parseInt(response) == 200) {
				$(".icon-close-notificacao").click();
				showNotification("brigadoAlert");
			}
		},
	});
}

function ativaBeta(idCadastro) {
	$.ajax({
		url: "/master/cadastros/ativabeta",
		data: {
			idCadastro: idCadastro,
		},
		type: "POST",
		success: function (response) {
			if (parseInt(response) == 200) window.location.href = "/backoffice";
		},
	});
}

function desativaBeta(idCadastro) {
	$.ajax({
		url: "/master/cadastros/desativabeta",
		data: {
			idCadastro: idCadastro,
		},
		type: "POST",
		success: function (response) {
			if (parseInt(response) == 200) window.location.href = "/portal";
		},
	});
}

function exibeSubMenu(idSubMenu) {
	$(".sub-menus").hide();
	$("#" + idSubMenu).show();
}

function addProdCarrinhoCompras(id) {
	let novoValorCarrinho = parseInt($(id).val()) + 1;
	novoValorCarrinho = novoValorCarrinho >= 0 ? novoValorCarrinho : 0;
	$(id).val(novoValorCarrinho);
	$(id + "-span").text(novoValorCarrinho);
	$(".attCarrinho").show();
}

function revProdCarrinhoCompras(id) {
	let novoValorCarrinho = parseInt($(id).val()) - 1;
	novoValorCarrinho = novoValorCarrinho >= 0 ? novoValorCarrinho : 0;
	$(id).val(novoValorCarrinho);
	$(id + "-span").text(novoValorCarrinho);
	$(".attCarrinho").show();
}

function isMobile() {
	return "ontouchstart" in document.documentElement;
}

function freshChat() {
	//freshChat
	window.fcWidget.init({
		token: "7b55a918-272f-456d-b45d-99371e00af64",
		host: "https://wchat.freshchat.com",
	});

	window.fcWidget.user.clear().then(
		function () {
			//console.log('no cache chat');
		},
		function () {
			//console.log('cache chat');
		},
	);

	// Make sure fcWidget.init is included before setting these values
	// To set unique user id in your system when it is available
	window.fcWidget.setExternalId(CADASTROID);
	// To set user name
	window.fcWidget.user.setFirstName(CADASTRONOME);
	// To set user email
	window.fcWidget.user.setEmail(CADASTROEMAIL);
	// To set user properties
	window.fcWidget.user.setProperties({
		plan: "Estate", // meta property 1
		status: "Active", // meta property 2
	});
	//------------------------> freshChat
}

function showNotificacao(
	notification = {
		title: "",
		body: "",
		id: "",
		classTitle: "",
		classBody: "",
	},
) {
	$("." + notification.classTitle).html(notification.title);
	$("." + notification.classBody).html(notification.body);
	showNotification(notification.id);
}

function showNotificationShop(
	notification = {
		title: "",
		body: "",
	},
) {
	showNotificacao({
		title: notification.title ?? "",
		body: notification.body ?? "",
		id: "notificacoesLoja",
		classTitle: "tituloNotificacaoLoja",
		classBody: "corpoNotificacaoLoja",
	});
}

function onPAReady() {

	let device = "pc";

	if (isMobile()) {
		device = "mobile";
	} else {
		device = "pc";
	}

	if (PushAlertCo.subs_id != "") {
		if (CADASTROID > 0) {
			$.ajax({
				url: "/master/cadastros/pushcadastro",
				data: {
					id: CADASTROID,
					pushID: PushAlertCo.subs_id,
					device: device,
				},
				type: "POST",
				success: function (response) {},
			});
		} else {
			$.ajax({
				url: "/master/cadastros/pushcadastro",
				data: {
					pushID: PushAlertCo.subs_id,
					device: device,
				},
				type: "POST",
				success: function (response) {},
			});
		}
	} else {
		if (CADASTROID > 0) {
			$.ajax({
				url: "/master/cadastros/pushcadastro",
				data: {
					id: CADASTROID,
				},
				type: "POST",
				success: function (response) {
					//console.log(response);
				},
			});
		}
	}
}

function inspectSite() {
	//<!-- Begin Inspectlet Asynchronous Code -->

	(function () {
		window.__insp = window.__insp || [];
		__insp.push(["wid", 423458439]);
		var ldinsp = function () {
			if (typeof window.__inspld != "undefined") return;
			window.__inspld = 1;
			var insp = document.createElement("script");
			insp.type = "text/javascript";
			insp.async = true;
			insp.id = "inspsync";
			insp.src =
				("https:" == document.location.protocol ? "https" : "http") +
				"://cdn.inspectlet.com/inspectlet.js?wid=423458439&r=" +
				Math.floor(new Date().getTime() / 3600000);
			var x = document.getElementsByTagName("script")[0];
			x.parentNode.insertBefore(insp, x);
		};
		setTimeout(ldinsp, 0);
	})();

	//<!-- End Inspectlet Asynchronous Code -->
}

function variaveisWChat() {
	// #################################################
	// # Optional
	// default is PNG but you may also use SVG
	emojione.imageType = "png";
	emojione.sprites = false;
	// default is ignore ASCII smileys like :) but you can easily turn them on
	emojione.ascii = true;
	// if you want to host the images somewhere else
	// you can easily change the default paths
	emojione.imagePathPNG = "/layouts/portal/plugins/wchat/smiley/assets/png/";
	emojione.imagePathSVG = "/layouts/portal/plugins/wchat/smiley/assets/svg/";
	// #################################################
}

function gtag() {
	dataLayer.push(arguments);
}

function notificacaoSucesso(texto) {
	$.notify(texto, "success");
}

function notificacaoPerido(texto) {
	$.notify(texto, "warn");
}

function notificacaoErro(texto) {
	$.notify(texto, "error");
}

function notificacaoInformacao(texto) {
	$.notify(texto, "info");
}

function arredondar(numero, precisao) {
	var factor = Math.pow(10, precisao);
	var tempNumber = numero * factor;
	var roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
}

function validateEmail(email) {
	var re =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function validarCPF(cpf) {
	cpf = cpf.replace(/[^\d]+/g, "");

	if (cpf == "") return 0;

	// Elimina CPFs invalidos conhecidos
	if (
		cpf.length != 11 ||
		cpf == "00000000000" ||
		cpf == "11111111111" ||
		cpf == "22222222222" ||
		cpf == "33333333333" ||
		cpf == "44444444444" ||
		cpf == "55555555555" ||
		cpf == "66666666666" ||
		cpf == "77777777777" ||
		cpf == "88888888888" ||
		cpf == "99999999999"
	)
		return 0;

	// Valida 1o digito
	var add = 0;
	var i = 0;
	var rev = 0;
	for (i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
	rev = 11 - (add % 11);
	if (rev == 10 || rev == 11) rev = 0;
	if (rev != parseInt(cpf.charAt(9))) return 0;

	// Valida 2o digito
	add = 0;
	for (i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
	rev = 11 - (add % 11);
	if (rev == 10 || rev == 11) rev = 0;
	if (rev != parseInt(cpf.charAt(10))) return 0;

	return 1;
} 

function validarCNPJ(cnpj) {
 
    cnpj = cnpj.replace(/[^\d]+/g,'');
 
    if(cnpj == '') return false;
     
    if (cnpj.length != 14)
        return false;
 
    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
         
    // Valida DVs
    var tamanho = cnpj.length - 2
    var numeros = cnpj.substring(0,tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
           
    return true;    
}

function somenteNumeros(e) {
	var charCode = e.charCode ? e.charCode : e.keyCode;
	// charCode 8 = backspace
	// charCode 9 = tab
	if (charCode != 8 && charCode != 9) {
		// charCode 48 equivale a 0
		// charCode 57 equivale a 9
		if (charCode < 48 || charCode > 57) return false; 
	}
}
// sleep time expects milliseconds
function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

function validacaoEmail(field) {
	var usuario = field.substring(0, field.indexOf("@"));
	var dominio = field.substring(field.indexOf("@") + 1, field.length);

	if (
		usuario.length >= 1 &&
		dominio.length >= 3 &&
		usuario.search("@") == -1 &&
		dominio.search("@") == -1 &&
		usuario.search(" ") == -1 &&
		dominio.search(" ") == -1 &&
		dominio.search(".") != -1 &&
		dominio.indexOf(".") >= 1 &&
		dominio.lastIndexOf(".") < dominio.length - 1
	)
		return 200;
	else return 500;
}

function especificosLoja() {
	$(".btnMais").click();
	$(".btnMenos").click();

	const headerSlider = new Swiper("#header-slider", {
		direction: "vertical",
		pagination: {
			el: "#header-slider .swiper-pagination",
		},
	});

	const highlightSlider = new Swiper("#highlights-slider", {
		slidesPerView: "auto",
		spaceBetween: 24,
		freeMode: true,
		pagination: {
			el: "#highlights-slider .swiper-pagination",
			clickable: true,
		},
	});
}

var dateInputMaskCartao = function dateInputMaskCartao(elm) {
	elm.addEventListener("keypress", function (e) {
		if (e.keyCode < 47 || e.keyCode > 57) e.preventDefault();

		var len = elm.value.length;

		// If we're at a particular place, let the user type the slash
		// i.e., 12/12/1212
		if (len !== 1 || len !== 3) {
			if (e.keyCode == 47) e.preventDefault();
		}

		// If they don't add the slash, do it for them...
		if (len === 2) elm.value += "/";

		// If they don't add the slash, do it for them...
		if (len === 5) {
			//elm.value += '/';
		}
	});
};

function dataValidadeCartao() {

	if ($("#mesCard").val() > 0 && $("#anoCard").val() > 0) {
		$("#input-validity-card").val(
			$("#mesCard").val() + "/" + $("#anoCard").val(),
		);

		$(".validity-date").val(
			$("#mesCard").val() + "/" + $("#anoCard").val(),
		);
	}
}

// Obtém dimensões do browser e da tela
function getSizeWinDoc() {
	// Size of browser viewport.
	var w_h = $(window).height();
	var w_w = $(window).width();

	// Size of HTML document (same as pageHeight/pageWidth in screenshot).
	var d_h = $(document).height();
	var d_w = $(document).width();

	var ret = { winHeigth: w_h, winWidth: w_w, docHeigth: d_h, docWidth: d_w };

	//console.log(ret);

	return ret;
}

// Função genérica para máscaras e validação
function maskarar(o, f) {
	setTimeout(function () {
		if (f == "maskInteger") var v = maskInteger(o.value);
		else if (f == "maskPhone") var v = maskPhone(o.value);
		else if (f == "maskDate") var v = maskDate(o.value);
		else if (f == "maskDateHour") var v = maskDateHour(o.value);
		else if (f == "maskCPF") var v = maskCPF(o.value);
		else if (f=='maskCnpj')      { var v = maskCnpj(o.value); }
		else alert("Function unknow!");

		if (v != o.value) o.value = v;
	}, 1);
}

// Máscaras e validação para números inteiros
function maskInteger(v) {
	var r = v.replace(/\D/g, "");
	return r;
}

// Máscaras e validação para número de telefone Fixo ou Celular
function maskPhone(v) {
	if (v != "" && v != null && v != "null") {
		var r = v.replace(/\D/g, "");
		r = r.replace(/^0/, "");
		if (r.length > 10)
			r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
		else if (r.length > 5)
			r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
		else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
		else r = r.replace(/^(\d*)/, "($1");

		return r;
	}
	return "";
}

// Máscaras e validação para Data
function maskDate(v) {
	v = v.replace(/\D/g, "");
	v = v.replace(/(\d{2})(\d)/, "$1/$2");
	v = v.replace(/(\d{2})(\d)/, "$1/$2");
	return v;
}

// Máscaras e validação para Data/Hora
function maskDateHour(v) {
	v = v.replace(/\D/g, "");
	v = v.replace(/(\d{2})(\d)/, "$1/$2");
	v = v.replace(/(\d{2})(\d)/, "$1/$2");
	v = v.replace(/(\d{4})(\d)/, "$1 $2");
	v = v.replace(/(\d{1})(\d{4})$/, "$1:$2");
	v = v.replace(/(\d{1})(\d{2})$/, "$1:$2");
	return v;
}

// Máscaras e validação para números inteiros
function maskCnpj(v) {
  var r = v.replace(/\D/g, "");
  r = r.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return r;
}

// Máscaras de CPF
function maskCPF(v) {
	v = v.replace(/[^\d]/g, "");
	v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	return v;
}

// Data/Hora de formato americano para britanico
function dateEnUSToPtBrHora(data) {
	var arr = data.split(" ");
	return arr[0].split("-").reverse().join("/") + " " + arr[1];
}

// Data de formato britanico para americano
function datePtBrToEnUS(data) {
	return data.split("/").reverse().join("-");
}

// Trunca um valor em "to" casas decimais
function truncateDecimal(number, to) {
	var n = parseFloat(number);
	var s = n.toString();
	var arr = s.split(".");
	var z = "00";
	if (arr[1] != undefined) {
		if (arr[1].length == 1) {
			z = arr[1] + "0";
		} else {
			z = arr[1];
		}
		z = z.substring(0, 2);
	}
	var v = arr[0] + "." + z;

	/* CODIGO OBSOLETO \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	var fixed = '1';
	for (var i=1; i<=to; i++) {
		fixed = fixed + '0';
	}	
	var fixeded = parseInt(fixed);
	return Math.trunc(number*fixeded)/fixeded;
	*/

	//alert(v);

	return v;
}

// Subistitui virgulo por ponto com o marcador de decimal
function v2p(v) {
	if (
		!v ||
		v.length === 0 ||
		v == 0 ||
		v == "0" ||
		v == "" ||
		v == null ||
		v == "null"
	) {
		v = 0.0;
	} else {
		v = v.toString().replace(".", "");
		v = v.replace(",", ".");
	}
	return v;
}

/*Função que padroniza valor com decimais*/
function maskDecimalPrint(v) {
	//return v;

	v = truncateDecimal(v, 2);

	if (
		!v ||
		v.length === 0 ||
		v == 0 ||
		v == "0" ||
		v == "" ||
		v == null ||
		v == "null"
	) {
		v = "0.00";
	}

	v = v.toString();

	var signal = parseFloat(v) < 0 ? "-" : "";

	var arr = v.split(".");
	var z = "00";
	if (arr[1] != undefined) {
		if (arr[1].length == 1) {
			z = arr[1] + "0";
		} else {
			z = arr[1];
		}
	}

	v = arr[0] + z;

	v = v.replace(/\D/g, ""); //permite digitar apenas números
	v = v.replace(/[0-9]{15}/, "inválido"); //limita pra máximo 999.999.999.999,99
	v = v.replace(/(\d{1})(\d{11})$/, "$1.$2"); //coloca ponto antes dos últimos 11 digitos
	v = v.replace(/(\d{1})(\d{8})$/, "$1.$2"); //coloca ponto antes dos últimos 8 digitos
	v = v.replace(/(\d{1})(\d{5})$/, "$1.$2"); //coloca ponto antes dos últimos 5 digitos
	v = v.replace(/(\d{1})(\d{1,2})$/, "$1,$2"); //coloca virgula antes dos últimos 2 digitos

	v = signal + v;

	return v;
}

/*Função que valida número de telefone*/

function validaTelefone(obj,clean,foco,msg,type) {
    
    var validaCelular=true;
    var validaTelefoneFixo=true;
    
    if(obj.value.length > 0) {
        var marcaCelular='';
        if(obj.value.length==13) {
           marcaCelular=obj.value.substr(4, 1);             
        }
        if(obj.value.length==14) {
           marcaCelular=obj.value.substr(4, 2);             
        }    
        var marcasPossiveis="_9_8_7_99_98_97_";

        if(type=='Celular') {    
            if(marcasPossiveis.indexOf(marcaCelular)==-1) {
                validaCelular=false;
            }
        }

        if(type=='Telefone') {    
            if(marcasPossiveis.indexOf(marcaCelular)!=-1) {
                validaTelefoneFixo=false;
            }
        }
    }
    
    if( ( obj.value.length > 0 && obj.value.length < 13) || validaCelular==false || validaTelefoneFixo==false ) {
        if(foco==1) {
            obj.focus();
        }
        if(clean==1) {
            obj.value='';
        }        
        if(msg==1) {
            alert('O Número de '+type+' informado não é válido.');
        }
        return false;
    }    
    return true;
}

function versaovmasterraw() {
	console.log('/public/layouts/backoffice_bt/js/master.js - 20');
}

// READ FUNCTION
/*
$("document").ready(function () {
	(pushalertbyiw = window.pushalertbyiw || []).push(["onReady", onPAReady]);

	$("#atlwdg-trigger, #pushalert-ticker").css({ background: "#b2b2f3" });

	if (FEEDBACKJIRA)
		jQuery.ajax({
			url: "https://akgroup.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/sb53l8/b/24/e73395c53c3b10fde2303f4bf74ffbf6/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=pt-BR&collectorId=59339fd7",
			type: "get",
			cache: true,
			dataType: "script",
		});

	freshChat();
	onPAReady();
	inspectSite();

	//funcoes datalayer
	gtag("js", new Date());
	gtag("config", "AW-639788044");

	//roda itens espeficos de uma determinado modulo
	if (MODULO == "backoffice") variaveisWChat();
	else if (MODULO == "loja") especificosLoja();

	//pedindo rating se o cliente ainda não deu na pagina
	if (PAGERATING == 0 && CADASTROID > 0)
		setTimeout(() => {
			//showNotification("ratingPage");
		}, 1000);

	var inputDateCartao = document.querySelectorAll(".js-date-cartao")[0];

	if (inputDateCartao != undefined) dateInputMaskCartao(inputDateCartao);
});
*/