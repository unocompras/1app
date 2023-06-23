angular.module("Backoffice", []);

angular.module("Backoffice").controller("index", function ($scope) {
	$scope.codigoSMS = 0;
	$scope.tempo = false;
	$scope.timeout = null;
	$scope.c = 60;

	$scope.email = document.getElementById("originalEmail").value;
	$scope.codigoEmail = 0;

	$scope.ddd = document.getElementById("originalDDD").value;
	$scope.cellphone = document.getElementById("originalCellphone").value;

	$scope.nome_fantasia = document.getElementById("originalNome_fantasia").value;

	$scope.rua = document.getElementById("originalRua").value;
	$scope.numero = parseInt(document.getElementById("originalNumero").value);
	$scope.complemento = document.getElementById("originalComplemento").value;
	$scope.bairro = document.getElementById("originalBairro").value;
	$scope.cidade = document.getElementById("originalCidade").value;
	$scope.estado = document.getElementById("originalEstado").value;
	$scope.cep = document.getElementById("originalCep").value;

	$scope.contSMSPrimeiro = function () {
		if ($scope.tempo) return true;

		$scope.c = $scope.c - 1;
		if ($scope.c >= 0) $scope.timeout = $scope.startTimeoutPrimeiroSMS();
		else {
			$scope.c = 60;
			$scope.tempo = true;
			return;
		}
	};

	$scope.startTimeoutPrimeiroSMS = function () {
		myVar = setTimeout(function () {
			$scope.contSMSPrimeiro();
		}, 1000);
	};

	$scope.contSMS = function () {
		if ($scope.tempo) return true;

		$("#reenviarsms")
			.val("Aguarde.(" + $scope.c + ")")
			.attr("disabled", "disabled")
			.css("color", "black");

		$scope.c = $scope.c - 1;
		if ($scope.c >= 0) $scope.timeout = $scope.startTimeoutSMS();
		else {
			$scope.c = 10;
			$scope.tempo = true;

			$("#reenviarsms").val("Reenviar SMS").removeAttr("disabled");
			return;
		}
	};

	$scope.startTimeoutSMS = function () {
		myVar = setTimeout(function () {
			$scope.contSMS();
		}, 1000);
	};

	$scope.sendSMS = function () {
		//cronometro SMS, Primeiro Envio
		$scope.tempo = false;
		$scope.contSMSPrimeiro();

		$.ajax({
			url: "/loja/index/smsprecadastro",
			data: {
				celular: $scope.ddd + $scope.cellphone,
			},
			type: "POST",
			success: function (response) {
				$scope.codigoSMS = atob(atob(response));
				$scope.codigoSMS = parseInt($scope.codigoSMS) - 921354;
				hideModal("modal-alterar-dados");
				showModal("confirm-cellphone");
				$("#confirm-cellphone").removeClass("hidden");
			},
		});
	};

	$scope.confirmSMS = function () {
		$scope.tempo = true;

		if (
			parseInt($scope.codigoSMS) ==
			parseInt($("input[name=codigosms]").val())
		) {
			$.ajax({
				url: "/backoffice/index/updatecellphone",
				data: {
					ddd: $scope.ddd,
					celular: $scope.cellphone,
				},
				type: "POST",
				success: function (res) {
					const response = JSON.parse(res);

					if (response["type"] == "success") {
						alert("Número de telefone atualizado!");
						hideModal("confirm-cellphone");
						showModal("modal-alterar-dados");
					} else
						alert(
							"Ocorreu um erro ao atualizar seu número de telefone",
						);
				},
			});
		} else {
			$scope.tempo = true;
			$("input[name=codigosms]").val("").focus();

			alert("Código incorreto!");
		}
	};

	$scope.reenviarsms = function () {
		alert(
			"Reenviamos um SMS com um código de validação para o seu número de celular.",
		);

		$.ajax({
			url: "/loja/index/smsprecadastro",
			data: {
				celular: $scope.ddd + $scope.cellphone,
			},
			type: "POST",
			beforeSend: function () {
				$scope.c = 10;
				$scope.tempo = false;
				$scope.contSMS();
			},
			success: function (response) {
				$scope.codigoSMS = atob(atob(response));
				$scope.codigoSMS = parseInt($scope.codigoSMS) - 921354;
			},
		});
	};

	$scope.consultaCEP = function (cep) {
		if (cep.length == 8) {
			$.getJSON(
				"https://viacep.com.br/ws/" + cep + "/json/?callback=?",
				function (dados) {
					if (!("erro" in dados)) {
						//Atualiza os campos com os valores da consulta.
						$("#rua").val(dados.logradouro);
						$("#bairro").val(dados.bairro);
						$("#cidade").val(dados.localidade);
						$("#estado").val(dados.uf);
						$("#numero").val("");
						$("#complemento").val("");

						$scope.cep = cep;
						$scope.estado = dados.uf;
						$scope.cidade = dados.localidade;
						$scope.bairro = dados.bairro;
						$scope.rua = dados.logradouro;
					} else {
						//CEP pesquisado não foi encontrado.
						// Limpa valores do formulário de cep.
						$("#rua").val("");
						$("#bairro").val("");
						$("#cidade").val("");
						$("#estado").val("");
						$("#numero").val("");
						$("#complemento").val("");

						alert("CEP incorreto!");

						$scope.cep = "";
						$scope.estado = "";
						$scope.cidade = "";
						$scope.bairro = "";
						$scope.rua = "";
						$scope.numero = "";
						$scope.complemento = "";
					}
				},
			);
		}
	};

	$scope.alterNomeFantasia = function () {
		$.ajax({
			url: "/backoffice/index/updatenomefantasia",
			data: {
				nome_fantasia: $scope.nome_fantasia,
			},
			type: "POST",
			success: function (res) {
				const response = JSON.parse(res);

				if (response["type"] == "success") alert("Dados atualizados!");
				else
					alert(
						"Houve um problema ao atualizar o nome fantasia / apelido!",
					);
			},
		});
	};

	$scope.alterAddress = function () {
		try {
			validateAddressFields();
		} catch (error) {
			if (error.type == "required") {
				$("#" + error.message).focus();
				alert("Campo " + error.message + " é obrigatório!");
			}

			if (error.type == "invalid") {
				$("#" + error.message).focus();
				alert("Campo " + error.message + " possui um valor inválido!");
			}

			return;
		}

		$.ajax({
			url: "/backoffice/index/updateaddress",
			data: {
				cep: $scope.cep,
				estado: $scope.estado,
				cidade: $scope.cidade,
				bairro: $scope.bairro,
				rua: $scope.rua,
				numero: $scope.numero,
				complemento: $scope.complemento,
			},
			type: "POST",
			success: function (res) {
				const response = JSON.parse(res);

				if (response["type"] == "success") alert("Dados atualizados!");
				else
					alert(
						"Houve um problema ao atualizar os dados de endereço!",
					);
			},
		});
	};

	function validateAddressFields() {
		const error = new Error();
		error.type = "required";

		if ($scope.cep == "") {
			error.message = "cep";
			throw error;
		}

		if ($scope.cep.length < 8) {
			error.type = "invalid";
			error.message = "cep";
			throw error;
		}

		if ($scope.estado == "") {
			error.message = "estado";
			throw error;
		}

		if ($scope.cidade == "") {
			error.message = "cidade";
			throw error;
		}

		if ($scope.bairro == "") {
			error.message = "bairro";
			throw error;
		}

		if ($scope.rua == "") {
			error.message = "rua";
			throw error;
		}

		if ($scope.numero == "") {
			error.message = "numero";
			throw error;
		}
	}

	$scope.finishAddressUpdates = function () {
		if (
			window.confirm(
				"Você tem certeza que não deseja alterar mais nenhum dado cadastral?",
			)
		) {
			hideModal("modal-alterar-dados");

			$.ajax({
				url: "/backoffice/index/finishaddressupdates",
				type: "POST",
			});
		}
	};

	$scope.sendCodeEmail = function () {
		$.ajax({
			url: "/backoffice/index/verifyemail",
			data: {
				email: $scope.email,
			},
			type: "POST",
			success: function (res) {
				const response = JSON.parse(res);

				$scope.codigoEmail = response.code;
				hideModal("modal-alterar-dados");
				showModal("modal-confirm-email");
			},
		});
	};

	$scope.confirmEmailCode = function () {
		if ($scope.codigoEmail == $("input[name=email_code]").val()) {
			$.ajax({
				url: "/backoffice/index/updateemail",
				data: {
					email: $scope.email,
				},
				type: "POST",
				success: function (res) {
					const response = JSON.parse(res);

					if (response["type"] == "success") {
						alert("Email atualizado!");
						hideModal("modal-confirm-email");
						showModal("modal-alterar-dados");
					} else alert("Ocorreu um erro ao atualizar seu email");
				},
			});
		} else {
			$("input[name=email_code]").val("").focus();

			alert("Código incorreto!");
		}
	};
});

angular.module("Backoffice").controller("cadastral", function ($scope) {
	$scope.codigoSMS = 0;
	$scope.tempo = false;
	$scope.timeout = null;
	$scope.c = 60;

	$scope.ddd = document.getElementById("originalDDD")?.value;
	$scope.numero = document.getElementById("originalCellphone")?.value;

	$scope.switch2FaAuth = function () {
		const checked = document.getElementById("2fa-toggle").checked;

		if (checked) showModal("modal-check-off");
		else showModal("modal-check-on");
	};

	$scope.contSMSPrimeiro = function () {
		if ($scope.tempo) return true;

		$scope.c = $scope.c - 1;
		if ($scope.c >= 0) $scope.timeout = $scope.startTimeoutPrimeiroSMS();
		else {
			$scope.c = 60;
			$scope.tempo = true;
			return;
		}
	};

	$scope.startTimeoutPrimeiroSMS = function () {
		myVar = setTimeout(function () {
			$scope.contSMSPrimeiro();
		}, 1000);
	};

	$scope.contSMS = function () {
		if ($scope.tempo) return true;

		$("#reenviarsms")
			.val("Aguarde.(" + $scope.c + ")")
			.attr("disabled", "disabled")
			.css("color", "black");

		$scope.c = $scope.c - 1;
		if ($scope.c >= 0) $scope.timeout = $scope.startTimeoutSMS();
		else {
			$scope.c = 10;
			$scope.tempo = true;

			$("#reenviarsms").val("Reenviar SMS").removeAttr("disabled");
			return;
		}
	};

	$scope.startTimeoutSMS = function () {
		myVar = setTimeout(function () {
			$scope.contSMS();
		}, 1000);
	};

	$scope.sendConfirmationSMS = function (modalId, confirmId) {
		//cronometro SMS, Primeiro Envio
		$scope.tempo = false;
		$scope.contSMSPrimeiro();

		$.ajax({
			url: "/loja/index/smsprecadastro",
			data: {
				celular: $scope.ddd + $scope.numero,
			},
			type: "POST",
			success: function (response) {
				$scope.codigoSMS = atob(atob(response));
				$scope.codigoSMS = parseInt($scope.codigoSMS) - 921354;
				hideModal(modalId);
				showModal(confirmId);
				$("#" + confirmId).removeClass("hidden");
			},
		});
	};

	$scope.sendLoginConfirmationSMS = function () {
		$scope.tempo = false;
		$scope.contSMSPrimeiro();
		const celular = document.getElementById("number").value;

		$.ajax({
			url: "/loja/index/smsprecadastro",
			data: {
				celular: celular,
			},
			type: "POST",
			success: function (response) {
				$scope.codigoSMS = atob(atob(response));
				$scope.codigoSMS = parseInt($scope.codigoSMS) - 921354;
				showModal("modal-2af");
				document.getElementById("modal-2af").classList.remove("hidden");
			},
		});
	};

	$scope.confirmSMSForUpdate = function () {
		$scope.tempo = true;

		if (
			parseInt($scope.codigoSMS) ==
			parseInt($("#change-number-code").val())
		) {
			$.ajax({
				url: "/backoffice/index/updatecellphone",
				data: {
					ddd: $scope.ddd,
					celular: $scope.numero,
				},
				type: "POST",
				success: function (res) {
					const response = JSON.parse(res);

					if (response["type"] == "success") {
						alert("Número de telefone atualizado!");
						document.getElementById("ddd-span").textContent =
							$scope.ddd;
						document.getElementById("numero-span").textContent =
							$scope.numero;
						hideModal("confirm-cellphone-change");
						showModal("modal-check-on");
					} else
						alert(
							"Ocorreu um erro ao atualizar seu número de telefone",
						);
				},
			});
		} else {
			$scope.tempo = true;
			$("#change-number-code").val("").focus();

			alert("Código incorreto!");
		}
	};

	$scope.confirmSMSForTurnOn = function () {
		$scope.tempo = true;

		if (parseInt($scope.codigoSMS) == parseInt($("#turn-on-code").val())) {
			$.ajax({
				url: "/backoffice/index/switch2af",
				data: {
					turnOn: 1,
				},
				type: "POST",
				success: function (res) {
					const response = JSON.parse(res);

					if (response["type"] == "success") {
						hideModal("confirm-cellphone-turn-on");
						document.getElementById("2fa-toggle").checked = true;
					} else
						alert(
							"Ocorreu um erro ao ativar a sua autenticação de dois fatores",
						);
				},
			});
		} else {
			$scope.tempo = true;
			$("#turn-on-code").val("").focus();

			alert("Código incorreto!");
		}
	};

	$scope.confirmSMSForTurnOff = function () {
		$scope.tempo = true;

		if (parseInt($scope.codigoSMS) == parseInt($("#turn-off-code").val())) {
			$.ajax({
				url: "/backoffice/index/switch2af",
				data: {
					turnOn: 0,
				},
				type: "POST",
				success: function (res) {
					const response = JSON.parse(res);

					if (response["type"] == "success") {
						hideModal("confirm-cellphone-turn-off");
						document.getElementById("2fa-toggle").checked = false;
					} else
						alert(
							"Ocorreu um erro ao desativar a sua autenticação de dois fatores",
						);
				},
			});
		} else {
			$scope.tempo = true;
			$("#turn-off-code").val("").focus();

			alert("Código incorreto!");
		}
	};

	$scope.confirmSMSForLogin = function () {
		$scope.tempo = true;

		if (parseInt($scope.codigoSMS) == parseInt($("#login-code").val()))
			document.getElementById("login2af").click();
		else {
			$scope.tempo = true;
			$("#login-code").val("").focus();

			alert("Código incorreto!");
		}
	};

	$scope.reenviarsms = function () {
		alert(
			"Reenviamos um SMS com um código de validação para o seu número de celular.",
		);

		$.ajax({
			url: "/loja/index/smsprecadastro",
			data: {
				celular: $scope.ddd + $scope.numero,
			},
			type: "POST",
			beforeSend: function () {
				$scope.c = 10;
				$scope.tempo = false;
				$scope.contSMS();
			},
			success: function (response) {
				$scope.codigoSMS = atob(atob(response));
				$scope.codigoSMS = parseInt($scope.codigoSMS) - 921354;
			},
		});
	};
});

//controller da loja virtual
angular.module("Backoffice").controller("shopOnePage", function ($scope) {
	notificacaoInformacao(
		"Olá, <i class='icon-display fa fa-smile-o'></i> para inciar as compras escolha o estado da loja em que você quer comprar.",
	);

	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//escondedo o corpo da loja
	$(".esperandoFranquia, .esperandoProduto, .esperandoAddProduto").hide();

	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//VARIAVEIS GLOBAIS DO CONTROLADOR DA LOJA QUE PRECISA SER PRE INICIADAS
	$scope.app = "SHOPPING AK EXPRESS";
	$scope.appPesquisa = "ENCONTRAR O MEU PRODUTO";
	$scope.appCompra = "PRODUTOS";
	$scope.appFranquiaBusca = "LOJA";
	$scope.appFinalizar = "FINALIZAR COMPRA";
	$scope.appFranquia = "ESCOLHA UMA FRANQUIA";
	$scope.travaFreteAddProduto = false;
	$scope.pesosTotalCarrinho = 0;

	$scope.urlConsultaCep = "/master/loja/retornafrete/"; // FRETE

	$scope.estadosFranquias = [];
	$scope.franquiasCore = [];
	$scope.dadosCliente = [];
	$scope.departamentos = [];
	$scope.categorias = [];
	$scope.produtos = [];
	$scope.franquias = [];
	$scope.estoqueFranquia = [];
	$scope.categoriasSelect = [];
	$scope.produtosVitrine = [];
	$scope.carrinho = [];
	$scope.freteSelectFor = [];

	$scope.franquiaSet = 0;
	$scope.franquiaNomeTB = "";
	$scope.franquiaEnderecoTB = "";
	$scope.franquiaTeleoneTB = "";
	$scope.franquiaIdTB = 0;

	$scope.carrinho_valorparcial = 0;
	$scope.carrinho_valortotal = 0;
	$scope.carrinho_pontostotais = 0;
	$scope.carrinho_frete = 0;
	$scope.carrinho_nomefrete = "";

	$scope.paraFinalizarCompras = false; //ve se pode ou nao finalizar as compras
	$scope.NaoAchouProdutoNoEstoque = true; //ve se achou o produto ou nao, pode ser que nao venho porque esta zero
	$scope.idFreteEscolhido = 1; //id do tipo frete  - TEM QUE SER 1 PORQUE 1 E RETIRADA LOCAL

	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//ROTINAS GET DE POPULAR DADOS

	//insere os estados das franquias
	$.get("/master/loja/retornarestadosfranquias", function (data) {
		retorno = JSON.parse(data);

		for (ret in retorno) {
			$scope.estadosFranquias.push(retorno[ret]);
			$("#selecFranquias").focus();
			//atualiznado campo por causa dos inserts
		}
	});

	//-------------------------------------------------------------------------------------------------------
	//pega franquias

	$.get("/master/loja/retornarfranquias", function (data) {
		retorno = JSON.parse(data);

		for (ret in retorno) {
			//console.log(retorno[ret]);
			$scope.franquiasCore.push(retorno[ret]);
			//atualiznado campo por causa dos inserts
		}
		//console.log($scope.franquiasCore);
	});

	//-------------------------------------------------------------------------------------------------------
	//carrega dados cliente
	$.get("/master/loja/retornacadastro", function (data) {
		retorno = JSON.parse(data);

		for (ret in retorno) {
			$scope.dadosCliente.push(retorno[ret]);
		}
	});
	//fim carrega dados cliente

	//-------------------------------------------------------------------------------------------------------
	// carregando os departamentos
	$.get("/master/loja/retornadepartamentos", function (data) {
		retorno = JSON.parse(data);

		for (ret in retorno) {
			$scope.departamentos.push(retorno[ret]);
			//atualiznado campo por causa dos inserts
		}
		$("#produto").focus();
		$("#idDepartamentosSelect").fadeOut().fadeIn();
	});
	//fim departamentos

	//-------------------------------------------------------------------------------------------------------
	// carregando os categorias
	$.get("/master/loja/retornacategorias", function (data) {
		retornoCat = JSON.parse(data);

		for (cartRet in retornoCat) {
			$scope.categorias.push(retornoCat[cartRet]);
		}

		$scope.categorias.push(retornoCat);
	});
	//fim categorias

	//-------------------------------------------------------------------------------------------------------
	// carregando os produtos
	$.get("/master/loja/retornaprodutos", function (data) {
		retorno = JSON.parse(data);

		for (ret in retorno) {
			$scope.produtos.push(retorno[ret]);
			//atualiznado campo por causa dos inserts
		}
	});
	//fim produtos

	//-------------------------------------------------------------------------------------------------------
	//carrega estoque franquia
	$scope.getEstoque = function () {
		if ($scope.franquiaIdTB > 0) {
			notificacaoSucesso(
				"Boas Compras <i class='icon-display fa fa-heart'></i>",
			);
			notificacaoInformacao(
				"Você pode econtrar o produto que você precisa pesquisando pelo nome ou pelo departamento dele.",
			);

			//voltando os selects para cor correta, casos ele tenha sido modificados por algumas validacao
			$("#sFranquiasEstados")
				.css("background-color", "white")
				.css("color", "black");
			$("#selecFranquias")
				.css("background-color", "white")
				.css("color", "black");

			$.get(
				"/master/loja/retornaestoque/swglg/" + $scope.franquiaIdTB,
				function (data) {
					retorno = JSON.parse(data);

					for (ret in retorno) {
						$scope.estoqueFranquia.push(retorno[ret]);
					}

					//notificacaoSucesso("Estoque carregado com sucesso!");
				},
			);
			$(".esperandoFranquia").show();
			$("#produto").focus();
			$("#idFreteSelect option:selected").prop("selected", false);
			if (
				$("#idFreteSelect option:selected").text() == "Retirar na Loja"
			) {
				$("#idFreteSelect option:selected").text("");
			}
			$("#idFreteSelect").val("");
			if ($scope.franquiaIdTB == 591) {
				$("#retirarLocalSelect").hide();
			} else {
				$("#retirarLocalSelect").show().text("Retirar na Loja");
			}
			$scope.appFranquia = $scope.franquiaNomeTB;
		} else {
			//mesangens se o clientes tentar escolher a franquia sem selecionar uma primeiro
			notificacaoPerido("Primeiro você precisa escolher uma franquia!");
			$("#sFranquiasEstados")
				.focus()
				.fadeOut()
				.fadeIn()
				.css("background-color", "red")
				.css("color", "white");
			$("#selecFranquias")
				.fadeOut()
				.fadeIn()
				.css("background-color", "red")
				.css("color", "white");
		}
	};

	//FIM DAS ROTINAS GET DE POPULAR DADOS

	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//FUNÇÕES DO CONTROLLER

	//fução para buscar as categorias
	$scope.buscaFranquias = function (estado) {
		$scope.franquias = [];

		for (fCore in $scope.franquiasCore) {
			if ($scope.franquiasCore[fCore].estado == estado) {
				var nomeCompleto =
					$scope.franquiasCore[fCore].nome_fantasia +
					" (" +
					$scope.franquiasCore[fCore].cidade +
					" / " +
					$scope.franquiasCore[fCore].bairro +
					" - " +
					$scope.franquiasCore[fCore].ddd +
					"-" +
					$scope.franquiasCore[fCore].telefone +
					" )";

				$scope.franquias.push({
					id: $scope.franquiasCore[fCore].id,
					nome: nomeCompleto,
					estado: $scope.franquiasCore[fCore].estado,
				});
			}
		}
	};

	$scope.exibeFranquia = function (idFranquia) {
		//notificacaoInformacao("Carregando informações...");

		for (fCore in $scope.franquiasCore) {
			if ($scope.franquiasCore[fCore].id == idFranquia) {
				$scope.franquiaNomeTB =
					$scope.franquiasCore[fCore].nome_fantasia;
				$scope.franquiaEnderecoTB =
					$scope.franquiasCore[fCore].cidade +
					" / " +
					$scope.franquiasCore[fCore].bairro;
				$scope.franquiaTeleoneTB =
					$scope.franquiasCore[fCore].ddd +
					" - " +
					$scope.franquiasCore[fCore].telefone;
				$scope.franquiaIdTB = $scope.franquiasCore[fCore].id;
				$scope.carrinho.splice(0); //limpa carrinho por causa do frete
			}
		}

		$("#divTopBuscaFranquias").show();
		notificacaoSucesso(
			"Bem vindo (a) a loja " +
				$scope.franquiaNomeTB +
				". </br> Para iniciar as compras click no </br> <i class='icon-display material-icons'>thumb_up</i>",
		);
	};

	//fim busca selecao de franquias

	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------

	//fução para buscar as categorias
	$scope.buscarCategorias = function (idDepartamento) {
		//limpa categorias existentes
		$scope.categoriasSelect = [];
		$scope.categoriasSelect.push({ id: 0, nome: "TODAS" });
		idCatSelect = 999999;
		for (cat in $scope.categorias) {
			if ($scope.categorias[cat].departamento == idDepartamento) {
				for (item in $scope.categorias[cat].itens) {
					nomeCat = $scope.categorias[cat].itens[item].nome;
					idCat = $scope.categorias[cat].itens[item].id;

					//insere a categoria
					$scope.categoriasSelect.push({ id: idCat, nome: nomeCat });

					//selecionando uma opacao dinamicamente, a primeira
					//if(idCatSelect>idCat){
					//	idCatSelect = idCat;
					//	sleep(100).then(() => { $("#idCatSelect").val(idCatSelect); });
					//}
				}
			}
		}

		//setando categoria 1
		//atualizando
		$("#produto").focus();
		$("#idCatSelect").fadeOut().fadeIn();
		sleep(300).then(() => {
			$("#idCatSelect").val(0);
		});
	};
	//fim busca categorias

	//busca produtos
	$scope.buscaProdutosDep = function (idDepartamento) {
		$(".esperandoProduto").show();

		//zera vitrine
		$scope.produtosVitrine = [];

		for (prod in $scope.produtos) {
			for (estoqueP in $scope.estoqueFranquia) {
				//so deixa produtos em estoque entrar
				if (
					$scope.produtos[prod].id ==
					$scope.estoqueFranquia[estoqueP].id_produto
				) {
					if (
						$scope.produtos[prod].id_departamento == idDepartamento
					) {
						//@update 03/07/2020
						if ($scope.produtos[prod].set_desconto == 1) {
							$scope.produtos[prod].pontos = arredondar(
								$scope.produtos[prod].valor_cliente *
									$scope.produtos[prod].fator,
								2,
							);
						} else {
							$scope.produtos[prod].pontos = 0;
						}

						$scope.produtosVitrine.push({
							id: $scope.produtos[prod].id,
							nome: $scope.produtos[prod].nome,
							pontos: String($scope.produtos[prod].pontos),
							url: $scope.produtos[prod].url_img,
							valor: arredondar(
								$scope.produtos[prod].valor_cliente,
								2,
							),
							valor_calcular: $scope.produtos[prod].valor_cliente,
							peso: $scope.produtos[prod].peso,
							estoque:
								$scope.estoqueFranquia[estoqueP].quantidade,
							valor_catalogo:
								$scope.produtos[prod].valor_catalogo,
							desconto_cliente: $scope.produtos[prod].desconto,
							set_desconto: $scope.produtos[prod].set_desconto,
						});
					}
				}
			}
		}
	};

	$scope.buscaProdutosCat = function (idCategoria, idDepartamento) {
		$(".esperandoProduto").show();

		//zera vitrine
		$scope.produtosVitrine = [];

		//corrigindo situacoes onde a categoria pode vir null
		if (!idCategoria > 0) {
			idCategoria = 0;
		}
		//populando vitrine de produtos
		for (prod in $scope.produtos) {
			for (estoqueP in $scope.estoqueFranquia) {
				if (
					$scope.produtos[prod].id ==
					$scope.estoqueFranquia[estoqueP].id_produto
				) {
					if (
						$scope.produtos[prod].id_categoria == idCategoria ||
						(idCategoria == 0 &&
							$scope.produtos[prod].id_departamento ==
								idDepartamento)
					) {
						//@update 03/07/2020
						if ($scope.produtos[prod].set_desconto == 1) {
							$scope.produtos[prod].pontos = arredondar(
								$scope.produtos[prod].valor_cliente *
									$scope.produtos[prod].fator,
								2,
							);
						} else {
							$scope.produtos[prod].pontos = 0;
						}

						$scope.produtosVitrine.push({
							id: $scope.produtos[prod].id,
							nome: $scope.produtos[prod].nome,
							pontos: String($scope.produtos[prod].pontos),
							url: $scope.produtos[prod].url_img,
							valor: arredondar(
								$scope.produtos[prod].valor_cliente,
								2,
							),
							valor_calcular: $scope.produtos[prod].valor_cliente,
							peso: $scope.produtos[prod].peso,
							estoque:
								$scope.estoqueFranquia[estoqueP].quantidade,
							valor_catalogo:
								$scope.produtos[prod].valor_catalogo,
							desconto_cliente: $scope.produtos[prod].desconto,
							set_desconto: $scope.produtos[prod].set_desconto,
						});
					}
				}
			} //fim for interno
		} //fim for externo
	};

	$scope.buscaProdutosNome = function (nomeBuscar) {
		$(".esperandoProduto").show();

		if (nomeBuscar.length > 2) {
			//zera vitrine
			$scope.produtosVitrine = [];

			for (prod in $scope.produtos) {
				var texto = $scope.produtos[prod].nome;

				if (
					texto.search(nomeBuscar.toUpperCase()) != -1 &&
					texto != ""
				) {
					for (estoqueP in $scope.estoqueFranquia) {
						//so deixa produtos em estoque entrar
						if (
							$scope.produtos[prod].id ==
							$scope.estoqueFranquia[estoqueP].id_produto
						) {
							//@update 03/07/2020
							if ($scope.produtos[prod].set_desconto == 1) {
								$scope.produtos[prod].pontos = arredondar(
									$scope.produtos[prod].valor_cliente *
										$scope.produtos[prod].fator,
									2,
								);
							} else {
								$scope.produtos[prod].pontos = 0;
							}

							$scope.produtosVitrine.push({
								id: $scope.produtos[prod].id,
								nome: $scope.produtos[prod].nome,
								pontos: String($scope.produtos[prod].pontos),
								url: $scope.produtos[prod].url_img,
								valor: arredondar(
									$scope.produtos[prod].valor_cliente,
									2,
								),
								valor_calcular:
									$scope.produtos[prod].valor_cliente,
								peso: $scope.produtos[prod].peso,
								estoque:
									$scope.estoqueFranquia[estoqueP].quantidade,
								valor_catalogo:
									$scope.produtos[prod].valor_catalogo,
								desconto_cliente:
									$scope.produtos[prod].desconto,
								set_desconto:
									$scope.produtos[prod].set_desconto,
							});
						}
					}
				}
			}
		}
	};

	//fim busca produtos
	//-------------------------------------------------------------------------

	//carrinho de compras
	$scope.addCarrinho = function (
		idProduto,
		nomeProduto,
		valorU,
		pontosU,
		quantidade,
		idFranquia,
		nomeFranquia,
		valorTotalItem,
		pontosTotalItem,
		peso,
		estoque,
	) {
		$scope.carrinho.push({
			idProduto: idProduto,
			nomeProduto: nomeProduto,
			valorUnitario: valorU,
			pontosUnitario: pontosU,
			quantidade: quantidade,
			franquia: idFranquia,
			franquiaNome: nomeFranquia,
			pontostl: pontosTotalItem,
			valortl: valorTotalItem,
			peso: peso,
			estoque: estoque,
		});
	};
	//fim carrinho decompras

	$scope.carrinhosCompras = function (
		idProduto,
		nomeProduto,
		valorU,
		pontosU,
		quantidade,
		valorCalc,
		peso,
		estoque,
	) {
		if ($scope.travaFreteAddProduto) {
			notificacaoPerido("Aguardando Correios...");
			return;
		}
		// $scope.zeraFrete();

		valorTotalItem = quantidade * valorCalc;

		//pontosU = arredondar(valorCalc * 0.3,2);

		pontosTotalItem = quantidade * pontosU;

		//console.log(valorTotalItem+" "+pontosTotalItem+" "+ quantidade+" valor unitario "+valorCalc);
		//verifica se o produto ja esta no carrinho
		var addProdutoCarrinho = true;
		for (carrinho in $scope.carrinho) {
			if (
				$scope.carrinho[carrinho].idProduto == idProduto &&
				$scope.franquiaIdTB == $scope.carrinho[carrinho].franquia
			) {
				addProdutoCarrinho = false;

				$scope.carrinho[carrinho].quantidade =
					$scope.carrinho[carrinho].quantidade + quantidade;

				if ($scope.carrinho[carrinho].quantidade > parseInt(estoque)) {
					$scope.carrinho[carrinho].quantidade = parseInt(estoque);
				}

				$scope.carrinho[carrinho].valortl = arredondar(
					$scope.carrinho[carrinho].quantidade * valorCalc,
					2,
				);
				$scope.carrinho[carrinho].pontostl = arredondar(
					$scope.carrinho[carrinho].quantidade * pontosU,
					2,
				);
			}
		}

		valorTotalItem = arredondar(valorTotalItem, 2);
		valorCalc = arredondar(valorCalc, 2);

		//se o produto nao estiver no carrinho add ele
		if (addProdutoCarrinho) {
			$scope.addCarrinho(
				idProduto,
				nomeProduto,
				valorCalc,
				pontosU,
				quantidade,
				$scope.franquiaIdTB,
				$scope.franquiaNomeTB,
				valorTotalItem,
				pontosTotalItem,
				peso,
				estoque,
			);
		}

		subTotal = 0;

		//console.log($scope.carrinho_valorparcial);

		$(".esperandoAddProduto").show();

		//vendo se é compra inicial
		$scope.acoesDEPOISModificaoCarrinho();
		//$scope.promocaoNatal($scope.franquiaIdTB);
		// $scope.atualizaFrete(0,0,0);
	};

	$scope.produtoEmEstoque = false;

	$scope.promocaoNatal = function (idFranquia) {
		idProduto = 789;
		idFranquia = idFranquia;
		quantidadeMax = 0;

		//vendo se tem o produto em estoque
		$scope.produtoEmEstoque = false;

		for (estoqueAtt in $scope.estoqueFranquia) {
			if (idProduto == $scope.estoqueFranquia[estoqueAtt].id_produto) {
				//achou produto no estoque
				$scope.produtoEmEstoque = true;
				quantidadeMax = parseInt(
					$scope.estoqueFranquia[estoqueAtt].quantidade,
				);
			} //fim if id produto e id franquia
		}
		//fim for estoque

		if ($scope.produtoEmEstoque) {
			//olha estoque

			valorCarrinho = 0;

			for (carrinho in $scope.carrinho) {
				valorCarrinho += $scope.carrinho[carrinho].valortl;
			}

			//foi mais facil tirar e colocar
			//-------------------------------
			for (carrinho in $scope.carrinho) {
				if (
					$scope.carrinho[carrinho].idProduto == idProduto &&
					idFranquia == $scope.carrinho[carrinho].franquia
				) {
					$scope.carrinho.splice(carrinho, 1);
				}
			}
			//-------------------------------

			if (valorCarrinho >= 50) {
				quantidade = Math.trunc(valorCarrinho / 50);
				quantidade =
					quantidade < quantidadeMax ? quantidade : quantidadeMax;

				//console.log("promocao " + quantidade);
				//console.log("valorCarrinho " + valorCarrinho);

				$scope.carrinhosCompras(
					idProduto,
					"SLIM REFRESHING MASSAGE GEL 150G - PROMOCAO NATAL 2019",
					0.01,
					0,
					quantidade,
					0.01,
					0.167,
					quantidadeMax,
				);
			}
		} //fim olha estoque
	};

	$scope.atualizaQuantidadeCarrinhosCompras = function (
		idProduto,
		idFranquia,
		quantidade,
	) {
		if ($scope.travaFreteAddProduto) {
			notificacaoPerido("Aguardando Correios...");
			return;
		}
		$scope.zeraFrete();

		//atualizando parciais
		$scope.carrinho_valorparcial = 0;
		$scope.carrinho_pontostotais = 0;
		$scope.pesosTotalCarrinho = 0;
		var removeItemCarrinho = false;

		for (carrinho in $scope.carrinho) {
			if (
				$scope.carrinho[carrinho].idProduto == idProduto &&
				idFranquia == $scope.carrinho[carrinho].franquia
			) {
				$scope.carrinho[carrinho].quantidade += parseInt(quantidade);

				if ($scope.carrinho[carrinho].quantidade < 0) {
					//vendo se remove, nao remove aqui de uma vez para nao atrapalhar a atualizacao do carrinho
					removeItemCarrinho = true;
				}

				//ajustando para não colocar mais que o estoque no carrinho e compras
				if (
					parseInt($scope.carrinho[carrinho].quantidade) >
					parseInt($scope.carrinho[carrinho].estoque)
				) {
					$scope.carrinho[carrinho].quantidade = parseInt(
						$scope.carrinho[carrinho].estoque,
					);
				}

				//ajusta a quantidade para calculos de reducao do carrinho
				$scope.carrinho[carrinho].quantidade =
					$scope.carrinho[carrinho].quantidade > 0
						? $scope.carrinho[carrinho].quantidade
						: 0;

				//console.log($scope.carrinho[carrinho].valorUnitario);
				//console.log($scope.carrinho[carrinho].quantidade);

				$scope.carrinho[carrinho].valortl = arredondar(
					$scope.carrinho[carrinho].quantidade *
						$scope.carrinho[carrinho].valorUnitario,
					2,
				);
				$scope.carrinho[carrinho].pontostl = arredondar(
					$scope.carrinho[carrinho].quantidade *
						$scope.carrinho[carrinho].pontosUnitario,
					2,
				);
			}

			$scope.carrinho_valorparcial += $scope.carrinho[carrinho].valortl;
			$scope.carrinho_pontostotais += $scope.carrinho[carrinho].pontostl;

			//remove item do carrinho
			if (removeItemCarrinho) {
				$scope.carrinho.splice(carrinho, 1);
				//console.log("carrinho "+carrinho);
				removeItemCarrinho = false;
			}
		}

		//vendo se é compra inicial
		$scope.acoesDEPOISModificaoCarrinho();
		//$scope.promocaoNatal(idFranquia);
		// $scope.atualizaFrete(0,0,0);
	};

	//------------------------------------------------------------------------
	//------------------------------ ATUALIZACAO E CALCULO DO FRETE
	$scope.alteraValorCarrinhoFrete = function (valor) {
		if ($scope.idFreteEscolhido == 2) {
			$scope.carrinho_frete = valor;
			$scope.carrinho_valortotal = arredondar(
				parseFloat($scope.carrinho_valorparcial) +
					parseFloat($scope.carrinho_frete),
				2,
			);
		} else if ($scope.idFreteEscolhido == 1) {
			$scope.carrinho_frete = 0;
			$scope.carrinho_valortotal = arredondar(
				parseFloat($scope.carrinho_valorparcial) +
					parseFloat($scope.carrinho_frete),
				2,
			);
		}
	};
	$scope.atualizaFrete = function (sawgla, swflg, swglg) {
		$("#btnCalculaFrete").hide();
		$scope.travaFreteAddProduto = true;
		notificacaoSucesso("Conectando aos Correios.");
		$("#imgLoadCorreios").show();

		//console.log(sawgla+" "+swflg+" "+swglg);

		$scope.freteSelectFor = [];
		//desabilita os selects por padrao
		$("#sedexSelect").prop("disabled", true);
		$("#pacSelect").prop("disabled", true);
		//volta para retirada Local porque umas das opcoes podem nao estar mais disponiveis

		// $('#idFreteSelect').val(1);

		$scope.escolheFrete($("#idFreteSelect").val());
		// $scope.carrinho_frete = 0;

		// var retorno =[{tipo: "1", valor: 0, nome: "Retira Local - R$ 0,00"}];

		// if($scope.carrinho_pontostotais < 50){

		// 	if($scope.carrinho_valorparcial >=170){
		// 		retorno.push({tipo: "2", valor: 0, nome: "PAC - R$ 0,00"});
		// 		$scope.alteraValorCarrinhoFrete(0);
		// 	}else{
		// 		retorno.push({tipo: "2", valor: 25, nome: "PAC - R$ 25,00"});
		// 		$scope.alteraValorCarrinhoFrete(25);
		// 	}
		// }else{
		// 	retorno.push({tipo: "2", valor: 0, nome: "PAC - R$ 0,00"});
		// 	$scope.alteraValorCarrinhoFrete(0);
		// }

		// $scope.freteSelectFor.push(retorno[0]);
		// $scope.freteSelectFor.push(retorno[1]);

		$scope.carrinho_valortotal = arredondar(
			parseFloat($scope.carrinho_valorparcial) +
				parseFloat($scope.carrinho_frete),
			2,
		);

		$("#pacSelect").prop("disabled", false);
		notificacaoSucesso("PAC liberado para seu endereço!");

		$("#imgLoadCorreios").hide();
		$("#btnCalculaFrete").show();
		notificacaoSucesso("Agora escolha a forma de envio.");
		$("#pacSelect").focus();
		$("#btnCalculaFrete").focus();
		$scope.travaFreteAddProduto = false;

		$.get(
			$scope.urlConsultaCep +
				"sawgla/" +
				sawgla +
				"/swflg/" +
				swflg +
				"/swglg/" +
				swglg,
			function (data) {
				retorno = JSON.parse(data);

				for (frete in retorno) {
					$scope.freteSelectFor.push(retorno[frete]);

					if (retorno[frete].tipo == 0) {
						$("#sedexSelect").prop("disabled", false);
						//notificacaoSucesso("Sedex liberado para seu endereço!");
					}
					if (retorno[frete].tipo == 2) {
						$("#pacSelect").prop("disabled", false);
						//notificacaoSucesso("PAC liberado para seu endereço!");
					}
				} //fim for

				$scope.travaFreteAddProduto = false;
				$("#imgLoadCorreios").hide();
				$("#btnCalculaFrete").show();
				notificacaoSucesso("Agora escolha a forma de envio.");
				$("#sedexSelect").focus();
			},
		);
	};

	//atualizao frete pela escolha do usuario
	$scope.escolheFrete = function (idFrete) {
		for (frete in $scope.freteSelectFor) {
			//console.log($scope.freteSelectFor[frete].tipo,idFrete);
			if ($scope.freteSelectFor[frete].tipo == idFrete) {
				$scope.carrinho_frete = $scope.freteSelectFor[frete].valor;
				//console.log($scope.freteSelectFor[frete].valor);
				$scope.idFreteEscolhido = idFrete;
				$scope.carrinho_valortotal = arredondar(
					parseFloat($scope.carrinho_valorparcial) +
						parseFloat($scope.freteSelectFor[frete].valor),
					2,
				);
				break;
			}
		}
	};

	$scope.zeraFrete = function () {
		//zerando escolhas de formas de envio
		$("#sedexSelect").prop("disabled", true);
		$("#pacSelect").prop("disabled", true);
		// $('#idFreteSelect').val(1);
		$scope.idFreteEscolhido = 1;
		//atualiza valores
		$scope.escolheFrete(1);
	};

	//calcula os somatorios do carrinhos de compras
	$scope.calculaValoresCarrinho = function () {
		$scope.carrinho_valorparcial = 0;
		$scope.carrinho_pontostotais = 0;
		$scope.pesosTotalCarrinho = 0;

		for (carrinho in $scope.carrinho) {
			$scope.carrinho_valorparcial += $scope.carrinho[carrinho].valortl;
			//@update 03/07/2020
			$scope.carrinho_pontostotais += arredondar(
				$scope.carrinho[carrinho].pontostl,
				2,
			);
			//arredondar($scope.carrinho[carrinho].valortl*0.3,2);//$scope.carrinho[carrinho].pontostl;
			$scope.pesosTotalCarrinho +=
				$scope.carrinho[carrinho].quantidade *
				$scope.carrinho[carrinho].peso;
		}

		$scope.carrinho_valorparcial = arredondar(
			$scope.carrinho_valorparcial,
			2,
		);
		$scope.carrinho_pontostotais = arredondar(
			$scope.carrinho_pontostotais,
			2,
		);
		$scope.pesosTotalCarrinho = arredondar($scope.pesosTotalCarrinho, 2);
		$scope.carrinho_valortotal = arredondar(
			$scope.carrinho_valorparcial + $scope.carrinho_frete,
			2,
		);
	};

	//calcula os somatorios do carrinhos de compras
	$scope.gerarCompra = function () {
		$(".fim_compra").attr("disabled", true);

		//conferindo estoque
		if ($scope.atualizaGetEstoque()) {
			//$(".fim_compra").removeAttr("disabled");
			return false;
		}
	};

	$scope.setGerarCompra = function () {
		var objCarrinhoString = JSON.stringify($scope.carrinho);

		$.ajax({
			url: "/master/loja/gerarfatura",
			data: {
				carrinhoString: objCarrinhoString,
				valorTotal: $scope.carrinho_valortotal,
				pesoTotal: $scope.pesosTotalCarrinho,
				pontosTotais: $scope.carrinho_pontostotais,
				frete: $scope.carrinho_frete,
				idTipoFrete: $scope.idFreteEscolhido,
			},
			type: "POST",
			success: function (response) {
				if (parseInt(response) > 0) {
					window.location = "/portal/faturas/detalhes/id/" + response;
				}
			},
		});
	};

	$scope.atualizaGetEstoque = function () {
		$scope.paraFinalizarCompras = false;

		$scope.estoqueFranquia = [];

		$.get(
			"/master/loja/retornaestoque/swglg/" + $scope.franquiaIdTB,
			function (data) {
				retorno = JSON.parse(data);

				for (ret in retorno) {
					$scope.estoqueFranquia.push(retorno[ret]);
				}

				//roda carrinho e ve se esta tudo OK com as quantidades
				for (carrinho in $scope.carrinho) {
					//zera para ver se ainda tem essa produtos no estoque, pode estar 0 e nao vir na url
					$scope.NaoAchouProdutoNoEstoque = true;

					for (estoqueAtt in $scope.estoqueFranquia) {
						if (
							$scope.carrinho[carrinho].idProduto ==
								$scope.estoqueFranquia[estoqueAtt].id_produto &&
							$scope.franquiaIdTB ==
								$scope.carrinho[carrinho].franquia
						) {
							//achou produto no estoque
							$scope.NaoAchouProdutoNoEstoque = false;

							if (
								$scope.carrinho[carrinho].quantidade >
								parseInt(
									$scope.estoqueFranquia[estoqueAtt]
										.quantidade,
								)
							) {
								diferenca =
									$scope.carrinho[carrinho].quantidade -
									parseInt(
										$scope.estoqueFranquia[estoqueAtt]
											.quantidade,
									);
								$scope.paraFinalizarCompras = true;

								for (var i = 0; i < diferenca; i++) {
									$(
										"#btnRemoveItem" +
											$scope.carrinho[carrinho].idProduto,
									).click();
								}
							} //fim if interno estoque
						} //fim if id produto e id franquia
					} //fim for estoque

					//tira valores de produtos que nao tem mais no estoque
					if ($scope.NaoAchouProdutoNoEstoque) {
						diferenca = $scope.carrinho[carrinho].quantidade + 1;
						for (var i = 0; i <= diferenca; i++) {
							$(
								"#btnRemoveItem" +
									$scope.carrinho[carrinho].idProduto,
							).click();
						}
						$scope.paraFinalizarCompras = true;
					}
				}

				if ($scope.paraFinalizarCompras) {
					//console.log('Atenção! Quantidades do carrinhos alteradas devidos a atualização de estoque da loja.');
					notificacaoPerido(
						"Atenção! Quantidades do carrinho alteradas devido a atualização de estoque da loja.",
					);

					//vendo se é compra inicial
					$scope.acoesDEPOISModificaoCarrinho();
				} else {
					$scope.setGerarCompra();
				}
			},
		);
	}; //fim atualiza estoque
	$scope.atualizaPontosCarrinho = function () {
		//console.log("entrou");

		for (carrinho in $scope.carrinho) {
			fatorDesconto = 0;

			for (prod in $scope.produtos) {
				if (
					$scope.carrinho[carrinho].idProduto ==
					$scope.produtos[prod].id
				) {
					//console.log("achoou produto para atualizar pontos");
					//console.log("pontos originais "+$scope.carrinho[carrinho].pontosUnitario);
					if (
						$scope.carrinho[carrinho].valorUnitario <
						$scope.produtos[prod].valor_catalogo
					) {
						//@update 03/07/2020
						if ($scope.produtos[prod].set_desconto == 1) {
							$scope.carrinho[carrinho].pontosUnitario =
								arredondar(
									$scope.carrinho[carrinho].valorUnitario *
										$scope.produtos[prod].fator,
									2,
								);
							//= $scope.produtos[prod].pontos;
						} else {
							$scope.carrinho[carrinho].pontosUnitario = 0;
						}

						$scope.carrinho[carrinho].pontosUnitario = arredondar(
							$scope.carrinho[carrinho].pontosUnitario,
							2,
						);

						$scope.carrinho[carrinho].pontostl =
							$scope.carrinho[carrinho].pontosUnitario *
							$scope.carrinho[carrinho].quantidade;
						$scope.carrinho[carrinho].pontostl = arredondar(
							$scope.carrinho[carrinho].pontostl,
							2,
						);
					} else {
						//@update 03/07/2020
						if ($scope.produtos[prod].set_desconto == 1) {
							$scope.carrinho[carrinho].pontosUnitario =
								arredondar(
									$scope.carrinho[carrinho].valorUnitario *
										$scope.produtos[prod].fator,
									2,
								);
							//= $scope.produtos[prod].pontos;
						} else {
							$scope.carrinho[carrinho].pontosUnitario = 0;
						}
						//$scope.carrinho[carrinho].pontosUnitario = arredondar($scope.carrinho[carrinho].valorUnitario  * 0.3,2);//= $scope.produtos[prod].pontos;
					}
					//console.log("pontos ajustados "+$scope.carrinho[carrinho].pontosUnitario);
				}
			}
		}
	};

	$scope.ProdutoSemDescontoPromocaoNatal = 0;

	$scope.mudaDescontoCarrinho = function (desconto, inicial) {
		//console.log("desconto "+desconto);
		if (inicial == 1) {
			for (carrinho in $scope.carrinho) {
				for (prod in $scope.produtos) {
					if (
						$scope.carrinho[carrinho].idProduto ==
							$scope.produtos[prod].id &&
						$scope.produtos[prod].set_desconto == 1 &&
						$scope.ProdutoSemDescontoPromocaoNatal !=
							$scope.carrinho[carrinho].idProduto
					) {
						//aplica desconto
						$scope.carrinho[carrinho].valorUnitario =
							$scope.produtos[prod].valor_catalogo -
							$scope.produtos[prod].valor_catalogo * desconto;
						$scope.carrinho[carrinho].valorUnitario = arredondar(
							$scope.carrinho[carrinho].valorUnitario,
							2,
						);
						//atualiza carrinho
						$scope.carrinho[carrinho].valortl = arredondar(
							$scope.carrinho[carrinho].quantidade *
								$scope.carrinho[carrinho].valorUnitario,
							2,
						);
					}
				}
			} //fim for externo
		} else if (inicial == 0) {
			//console.log('entrou no else if');

			var pontosMin = 0;

			for (carrinho in $scope.carrinho) {
				//console.log("pontosMin "+pontosMin+" $scope.dadosCliente[0].pontos_max "+$scope.dadosCliente[0].pontos_max);

				//equanto os pontos mim não foram maiores não da desconto
				if (pontosMin >= $scope.dadosCliente[0].pontos_max) {
					for (prod in $scope.produtos) {
						if (
							$scope.carrinho[carrinho].idProduto ==
								$scope.produtos[prod].id &&
							$scope.produtos[prod].set_desconto == 1 &&
							$scope.ProdutoSemDescontoPromocaoNatal !=
								$scope.carrinho[carrinho].idProduto
						) {
							pontosMin += arredondar(
								$scope.carrinho[carrinho].valorUnitario *
									$scope.produtos[prod].fator,
								2,
							);
							//console.log("entrou "+pontosMin);

							//aplica desconto
							$scope.carrinho[carrinho].valorUnitario =
								$scope.produtos[prod].valor_catalogo -
								$scope.produtos[prod].valor_catalogo * desconto;
							$scope.carrinho[carrinho].valorUnitario =
								arredondar(
									$scope.carrinho[carrinho].valorUnitario,
									2,
								);
							//atualiza carrinho
							$scope.carrinho[carrinho].valortl = arredondar(
								$scope.carrinho[carrinho].quantidade *
									$scope.carrinho[carrinho].valorUnitario,
								2,
							);
						}
					} //fim for produtos
				} else {
					//aumenta o valor dos produtos quando o cliente tira do carrinhos
					for (prod in $scope.produtos) {
						if (
							$scope.carrinho[carrinho].idProduto ==
								$scope.produtos[prod].id &&
							$scope.produtos[prod].set_desconto == 1 &&
							$scope.ProdutoSemDescontoPromocaoNatal !=
								$scope.carrinho[carrinho].idProduto
						) {
							pontosMin += arredondar(
								$scope.carrinho[carrinho].valorUnitario *
									$scope.produtos[prod].fator,
								2,
							);
							//console.log("entrou "+pontosMin);

							//aplica desconto
							$scope.carrinho[carrinho].valorUnitario =
								$scope.produtos[prod].valor_catalogo -
								$scope.produtos[prod].valor_catalogo *
									$scope.dadosCliente[0].desconto;
							$scope.carrinho[carrinho].valorUnitario =
								arredondar(
									$scope.carrinho[carrinho].valorUnitario,
									2,
								);
							//atualiza carrinho
							$scope.carrinho[carrinho].valortl = arredondar(
								$scope.carrinho[carrinho].quantidade *
									$scope.carrinho[carrinho].valorUnitario,
								2,
							);
						}
					} //fim for produtos
				}
				//@update 03/07/2020
				// pontosMin += arredondar($scope.carrinho[carrinho].valortl*0.3,2);
			} //fim for externo
		}

		$scope.atualizaPontosCarrinho();
		$scope.calculaValoresCarrinho();
	};
	//controla Compra Inicial
	$scope.clienteNaoAtivo = function () {
		if (
			$scope.dadosCliente[0].qualificacao > 0 &&
			$scope.dadosCliente[0].desconto == 0.2
		) {
			//console.log('Compra Inicial');

			var pontos = 0;
			var vaiTerDesconto = false; 

			//vendo se vai ter desconto
			for (carrinho in $scope.carrinho) {
				pontos += $scope.carrinho[carrinho].pontostl;
				if (pontos > $scope.dadosCliente[0].pontos_max) {
					//console.log("entrou na libera");
					vaiTerDesconto = true;
					break;
				}
			}

			//console.log("pontos "+pontos);
			//console.log("pontos_min "+$scope.dadosCliente[0].pontos_min);

			if (vaiTerDesconto) {
				//console.log('Vai ter Desconto');
				$scope.mudaDescontoCarrinho(
					$scope.dadosCliente[0].desconto_pos_compra,
					0,
				);
				//notificacaoSucesso("Desconto de ativação aplicado!");
			} else {
				//console.log('Não vai ter Desconto');
				$scope.mudaDescontoCarrinho($scope.dadosCliente[0].desconto, 1);
			}
		}
	};
	//controla Compra Inicial
	$scope.compraInicial = function () {
		if ($scope.dadosCliente[0].qualificacao_manutencao == 0) {
			//console.log('Compra Inicial');

			var pontos = 0;
			var vaiTerDesconto = false;

			//vendo se vai ter desconto
			for (carrinho in $scope.carrinho) {
				pontos += $scope.carrinho[carrinho].pontostl;
				//if(pontos>$scope.dadosCliente[0].pontos_min){
				//console.log("entrou na libera");
				//vaiTerDesconto = true;
				//break;
				//}
			}

			//implementacao em 11/12/2019
			//mudanca da rotina de descontos
			var desconto122019 = 0;
			var fator1 = 1;
			var fator2 = 1;

			if (parseFloat(pontos) >= 500 * fator1) {
				vaiTerDesconto = true;
				desconto122019 = 0.4;
			} else if (
				parseFloat(pontos) >= 300 * fator1 &&
				parseFloat(pontos) < 500 * fator2
			) {
				vaiTerDesconto = true;
				desconto122019 = 0.3;
			} else if (
				parseFloat(pontos) >= 100 * fator1 &&
				parseFloat(pontos) < 300 * fator2
			) {
				vaiTerDesconto = true;
				desconto122019 = 0.2;
			}

			//console.log("pontos "+parseFloat(pontos));
			//console.log("desconto " + desconto122019);
			//console.log("pontos_min "+$scope.dadosCliente[0].pontos_min);

			if (vaiTerDesconto) {
				//console.log('Vai ter Desconto');
				$scope.mudaDescontoCarrinho(desconto122019, 1);
				//$scope.dadosCliente[0].desconto_compra
				//notificacaoSucesso("Desconto de compra inicial aplicado!");
			} else {
				//console.log('Não vai ter Desconto');
				$scope.mudaDescontoCarrinho($scope.dadosCliente[0].desconto, 1);
			}
		}
	};

	//controla Compra Inicial
	$scope.acoesDEPOISModificaoCarrinho = function () {
		//lendo carrinho e computando valores
		$scope.calculaValoresCarrinho();

		//vendo se é compra inicial
		$scope.compraInicial();

		//vendo cliente nao ativo
		$scope.clienteNaoAtivo();
	};
});
//FIM CONTROLLER DA LOJA
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//INICIO CONTROLLER DE PAGAMENTOS
angular.module("Backoffice").controller("pagamentos", function ($scope) {
	//variaveis de configuracao
	$scope.minCartao = 10;

	//variaveis de manipulacao
	$scope.valorOriginal = 0;
	$scope.valorAberto = 0;
	$scope.valorUtilizar = 0;
	$scope.valorMoney = 0;
	$scope.valorCreditos = 0;
	$scope.valorCartao = 0;
	$scope.saldoMoney = 0;
	$scope.saldoCreditos = 0;
	$scope.idFatura = 0;

	$scope.valorMoneySALDOPREV = 0;
	$scope.valorCreditosSALDOPREV = 0;
	$scope.valorCartaoSALDOPREV = 0;

	//cartao
	$scope.bandeira = 0;
	$scope.parcelas = 1;
	$scope.nomeTitular = "";
	$scope.numeroCartao = "";
	$scope.mesValidade = 0;
	$scope.anoValidade = 0;
	$scope.mesAnoCartao = "";
	$scope.mesCard = "";
	$scope.anoCard = "";
	$scope.codigoSeguranca = "";
	$scope.codigoEstabelecimento = "";
	$scope.valorCartaoJuros = 0;
	$scope.limitadorValorMaximoQuePodePagarComBonus = 0;

	$scope.isConsumer = 0;

	//determina se é um kit ak 500 
	$scope.isKitAk500 = false;


	$scope.configuracaoJuros = function () {
		var jurosCartao = parseFloat($scope.valorCartaoSALDOPREV);

		/* if($scope.isKitAk500){
			switch(parseInt($scope.parcelas)){
				case 1:  jurosCartao = jurosCartao; break;
				case 2:  jurosCartao = jurosCartao; break;
				case 3:  jurosCartao = jurosCartao; break;
				case 4:  jurosCartao = jurosCartao * 1.08199; break;
				case 5:  jurosCartao = jurosCartao * 1.10352; break;
				case 6:  jurosCartao = jurosCartao * 1.12548; break;
			}
			$scope.valorCartaoJuros = arredondar(jurosCartao,2);
			return;
		}*/

		//1 parcela
		switch (parseInt($scope.parcelas)) {
			case 1:
				jurosCartao = jurosCartao;
				break;
			case 2:
				jurosCartao = jurosCartao * 1.04780;
				break;
			case 3:
				jurosCartao = jurosCartao * 1.07284;
				break;
			case 4:
				jurosCartao = jurosCartao * 1.09848;
				break;
			case 5:
				jurosCartao = jurosCartao * 1.12474;
				break;
			case 6:
				jurosCartao = jurosCartao * 1.15162;
				break;
			case 7:
				jurosCartao = jurosCartao * 1.17914;
				break;
			case 8:
				jurosCartao = jurosCartao * 1.20732;
				break;
			case 9:
				jurosCartao = jurosCartao * 1.23618;
				break;
			case 10:
				jurosCartao = jurosCartao * 1.26572;
				break;
			case 11:
				jurosCartao = jurosCartao * 1.29597;
				break;
			case 12:
				jurosCartao = jurosCartao * 1.32695;
				break;
		}

		$scope.valorCartaoJuros = arredondar(jurosCartao, 2);
	};

	$scope.preCarregamentoInformacoes = function (
		valorAberto,
		saldoMoney,
		saldoCreditos,
		idFatura,
		valorOriginal,
		limitadorValorMaximoQuePodePagarComBonus,
		sourceIsConsumer,
		faturaPontos, 
		qualificacaoCadastro,
		isPagamento
	) {
		/*
		if(sourceIsConsumer==1) {
			$scope.valorCartao = arredondar(valorAberto, 2);
		}
		*/
		$scope.isConsumer = sourceIsConsumer;

		$scope.valorAberto = arredondar(valorAberto, 2);
		$scope.saldoMoney = saldoMoney;
		$scope.saldoCreditos = saldoCreditos;
		//$scope.saldoMoney                             = saldoMoney;
		//$scope.tetoSaldoCreditos                      = tetoSaldoCreditos;
		$scope.idFatura = idFatura;
		$scope.valorOriginal = valorOriginal;
		$scope.limitadorValorMaximoQuePodePagarComBonus  = limitadorValorMaximoQuePodePagarComBonus;
		$scope.sumValorMaximoQuePodePagarComBonus = 0;

		if(faturaPontos >= 500 && qualificacaoCadastro == 0){
			$scope.isKitAk500 = true;
		}

		$scope.isPagamento = isPagamento;

		$scope.retornaValorFatura(); // atualiza valor para o cliente, so visualização
	};

	$scope.controleFormasPG = 0;
	//valida os valores a serem utilizados

	//valida os valores a serem utilizados
	$scope.validacaoValores = function (changeField = null) {

		$scope.limitadorValorMaximoQuePodePagarComBonus = $scope.limitadorValorMaximoQuePodePagarComBonus;
		$scope.valorCreditos = $scope.valorCreditos;
		$scope.valorMoney = $scope.valorMoney;

		//controla valores menor que zero
		if ($scope.valorMoney < 0) {
			$scope.valorMoney = 0;
		}
		if ($scope.valorCreditos < 0) {
			$scope.valorCreditos = 0;
		}
		if ($scope.valorCartao < 0) {
			$scope.valorCartao = 0;
		}

		//controla valores maiores que o saldo das formas de pagamento
		if ($scope.valorMoney > $scope.saldoMoney) {
			$scope.valorMoney = $scope.saldoMoney;
		}
		if ($scope.valorCreditos > $scope.saldoCreditos) {
			$scope.valorCreditos = $scope.saldoCreditos;
		}

		if (
			$scope.valorMoney + $scope.valorCreditos >
			$scope.limitadorValorMaximoQuePodePagarComBonus
		) {
			valorExcedido = $scope.valorMoney + $scope.valorCreditos;

			if (changeField == "AK_CREDITOS") {
				subCreditos =
					valorExcedido -
					$scope.limitadorValorMaximoQuePodePagarComBonus;
				$scope.valorCreditos = arredondar(
					$scope.valorCreditos - subCreditos,
					2,
				);
			}

			if (changeField == "AK_POINTS") {
				subMoney =
					valorExcedido -
					$scope.limitadorValorMaximoQuePodePagarComBonus;
				$scope.valorMoney = arredondar($scope.valorMoney - subMoney, 2);
			}
		}

		//controla parcelas maiores que o valor pago
		if (
			$scope.valorMoney + $scope.valorCreditos + $scope.valorCartao >
			$scope.valorAberto
		) {

			$scope.valorMoney = $scope.valorMoneySALDOPREV;
			$scope.valorCreditos = $scope.valorCreditosSALDOPREV;
			$scope.valorCartao = $scope.valorCartaoSALDOPREV;
		} 
		else {

			$scope.valorMoneySALDOPREV = $scope.valorMoney;
			$scope.valorCreditosSALDOPREV = $scope.valorCreditos;
			$scope.valorCartaoSALDOPREV = $scope.valorCartao;
		}

		$scope.retornaValorFatura(); // atualiza valor para o cliente, so visualização
		$scope.configuracaoJuros();
	};

	//processa pagamentos
	$scope.vlAkCreditosDebitar = 0;
	$scope.vlAkMoneyDevitar = 0;
	$scope.vlCartaoWebDebitar = 0;

	$scope.processaPagamento = function () {

		$("#pgInformacoesCartao").html('');
		$("#pgInformacoesC").html('');
		$("#pgInformacoesM").html('');

		$("#modalPGCartaoWeb").hide();
		$("#modalPGAKCreditos").hide();
		$("#modalPGAKMoney").hide();

		$('#modal-de-texto').modal('toggle');

		var tempoModal = 0;		

		if($scope.valorMoneySALDOPREV > 0) 		tempoModal += 5000;
		if($scope.valorCreditosSALDOPREV > 0)	tempoModal += 5000;
		if($scope.valorCartaoSALDOPREV > 0)		tempoModal += 5000;

		if (
			!(
				$scope.valorMoneySALDOPREV > 0 ||
				$scope.valorCreditosSALDOPREV > 0 ||
				$scope.valorCartaoSALDOPREV > 0
			)
		) {
			return false;
		}

		//resetando modals
		$("#modalPGAKCreditos").hide();
		$("#progressoModalPGAKCreditos").css("width", "0%");
		$("#modalPGAKMoney").hide();
		$("#progressoModalPGAKMoney").css("width", "0%");
		$("#modalPGCartaoWeb").hide();
		$("#progressoModalPGCartaoWeb").css("width", "0%");
		$("#pgInformacoesC").html("");
		$("#pgInformacoesM").html("");
		$("#pgInformacoesCartao").html("");

		$("#msnPagamentoTitulo").html(
			"<h3>Aguarde! Processando Pagamento</h3>",
		);
		
		//tirando o indicador
		$(
			"#progressoModalPGAKCreditos, #progressoModalPGAKMoney, #progressoModalPGCartaoWeb",
		)
			.addClass("progress-indicating")
			.addClass("progress-indicating")
			.html("");

		//iniciando pagamentos
		if ($scope.valorCreditosSALDOPREV > 0) {
			$("#modalPGAKCreditos").show();
			$("#progressoModalPGAKCreditos").css("width", "10%").html("10%");

			//notificacaoSucesso("Processando Ak Créditos!");
			$("#pgInformacoesC").html("<strong><br>Processando Ak Créditos...</strong>");
			$("#progressoModalPGAKCreditos").css("width", "30%").html("30%");

			$('#btn-close-modal-de-texto').attr('disabled','disabled');
			$('#btn-close-modal-de-texto-2').attr('disabled','disabled');

			$.ajax({
				url: "/backoffice/faturas/processacreditos",
				data: {
					creditos: $scope.valorCreditosSALDOPREV,
					idFatura: $scope.idFatura,
					_token: $('meta[name="_token"]').attr('content')
				},
				type: "POST",
				success: function (response) {
					//console.log('AK Créditos');
					$("#progressoModalPGAKCreditos").css("width", "60%").html("60%");
					switch (parseInt(response)) {
						case 100200:
							$("#pgInformacoesC").html(
								"<strong><br>Pagamento com Ak Créditos<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br>",
							);
							setTimeout(function () {
								$('#modal-de-texto').modal('hide');
							}, tempoModal);

							$scope.vlAkCreditosDebitar = $scope.valorCreditosSALDOPREV;
							break;

						case 100501:

							$("#pgInformacoesC").html(
								"<strong><br>Pagamento com Ak Créditos<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;SALDO INSUFICIENTE&nbsp;</span><br>",
							);
							break;

						case 100502:

							$("#pgInformacoesC").html(
								"<strong><br>Pagamento com Ak Créditos<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FATURA JÁ ESTÁ PAGA&nbsp;</span><br>",
							);
							break;

						case 100500:

							$("#pgInformacoesC").html(
								"<strong><br>Pagamento com Ak Créditos<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU, VERIFIQUE AS INFORMAÇÕES&nbsp;</span><br>",
							);
							break;

					} 

					$("#progressoModalPGAKCreditos")
						.css("width", "100%")
						.html("100%");
					$scope.ajustaValoresPosPagamento("AK_CREDITOS");

					$('#btn-close-modal-de-texto').removeAttr('disabled');
					$('#btn-close-modal-de-texto-2').removeAttr('disabled');
					
					
					if ($scope.valorMoneySALDOPREV > 0) {
						//console.log('AK Money');
						$("#modalPGAKMoney").show();
						$("#progressoModalPGAKMoney").css("width", "10%").html("10%");
			
						$("#pgInformacoesM").html("<strong><br>Processando Ak Points...</strong>");
						$("#progressoModalPGAKMoney").css("width", "30%").html("30%");
			
						$('#btn-close-modal-de-texto').attr('disabled','disabled');
						$('#btn-close-modal-de-texto-2').attr('disabled','disabled');
			
						$.ajax({
							url: "/backoffice/faturas/processamoney",
							data: {
								money: $scope.valorMoneySALDOPREV,
								idFatura: $scope.idFatura,
								_token: $('meta[name="_token"]').attr('content')
							},
							type: "POST",
							success: function (response) {
								$("#progressoModalPGAKMoney")
									.css("width", "60%")
									.html("60%");
								switch (parseInt(response)) {
			
									case 100200:
			
										$("#pgInformacoesM").html(
											"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br>",
										);
										setTimeout(function () {
											$('#modal-de-texto').modal('hide');
										}, tempoModal);
			
										$scope.vlAkMoneyDevitar = $scope.valorMoneySALDOPREV;
										break;
			
									case 100501:
			
										$("#pgInformacoesM").html(
											"</strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;SALDO INSUFICIENTE&nbsp;</span><br>",
										);
										break;
			
									case 100502:
			
										$("#pgInformacoesM").html(
											"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FATURA JÁ ESTÁ PAGA&nbsp;</span><br>",
										);
										break;
			
									case 100500:
			
										$("#pgInformacoesM").html(
											"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU, VERIFIQUE AS INFORMAÇÕES&nbsp;</span><br>",
										);
										break;
								} 
			
								$("#progressoModalPGAKMoney")
									.css("width", "100%")
									.html("100%");
								$scope.ajustaValoresPosPagamento("AK_POINTS");
			
								$('#btn-close-modal-de-texto').removeAttr('disabled');
								$('#btn-close-modal-de-texto-2').removeAttr('disabled');
								
								//PLACE CREDIT CARD
								if ($scope.valorCartaoSALDOPREV > 0 && $scope.valorCartaoJuros > 0) {
									console.log('CREDIT CARD');
									$("#modalPGCartaoWeb").show();
									$("#progressoModalPGCartaoWeb").css("width", "10%").html("10%");
						
									$scope.bandeira = 0;
						
									//verificando dados
						
									if ($scope.nomeTitular == "") {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o nome do titular do cartão!<br>",
										);
										return false;
									}
									if (!$scope.numeroCartao > 0) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o número do cartão!<br>",
										);
										return false;
									}
									if ($("select[name=bandeira]").val() > 0) {
										$scope.bandeira = $("select[name=bandeira]").val();
									}
									if (!$scope.bandeira > 0) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha uma bandeira!<br>",
										);
										return false;
									}			
									if (
										parseInt($scope.mesCard) == 0  ||
										parseInt($scope.anoCard) == 0  ||
										$scope.mesCard == '' ||
										$scope.anoCard == ''
									) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Selecione o mês e o ano de validade do cartão!<br>",
										);
										return false;
									}						
									if (!$scope.codigoSeguranca > 0) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o código de segurança do cartão!<br>",
										);
										return false;
									}			
									if (!$scope.parcelas > 0) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha a quantidade de parcelas!<br>",
										);
										return false;
									}
									if ($scope.valorCartaoSALDOPREV < 10) {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O pagamento mínimo é de 10 reais!<br>",
										);
										return false;
									}
									$("#progressoModalPGCartaoWeb").css("width", "40%").html("40%");
						
									if (parseInt($scope.mesCard) > 0) {
										$scope.mesValidade = $scope.mesCard;
									} else {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O mês do cartão deve ser informado!<br>",
										);
										return false;
									}
						
									if (parseInt($scope.anoCard) > 0) {
										$scope.anoValidade = $scope.anoCard;
									} else {
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O ano do cartão deve ser informado!<br>",
										);				
										return false;
									}
						
									//fim da verificacao de dados
						
									$("#pgInformacoesCartao").html("<strong><br>Processando Cartão...</strong>");
									$("#progressoModalPGCartaoWeb").css("width", "50%").html("50%");
						
									/*
									if($scope.mesAnoCartao.length==5){
										$scope.mesAnoCartao = $scope.mesAnoCartao.split('/');
										if((parseInt($scope.mesAnoCartao[0])!="NaN") &&(parseInt($scope.mesAnoCartao[1])!="NaN")){
											$scope.mesValidade = $scope.mesAnoCartao[0];
											$scope.anoValidade = $scope.mesAnoCartao[1];
										}else{
											showNotification('alert-falha8'); 
											setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
											return false;
										}				
						
									}else{
										showNotification('alert-falha8'); 
										setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
										return false;
									}*/
						
									$('#btn-close-modal-de-texto').attr('disabled','disabled');
									$('#btn-close-modal-de-texto-2').attr('disabled','disabled');
						
									$.ajax({
						
										url: "/backoffice/faturas/processacartao",
										data: {
											valor_PGfatura: btoa($scope.valorCartaoSALDOPREV),
											valor: btoa($scope.valorCartaoJuros),
											valor_total: btoa($scope.valorCartaoJuros),
											fatura: btoa($scope.idFatura),
											bandeira: btoa($scope.bandeira),
											parcelas: btoa($scope.parcelas),
											nome_portador: btoa($scope.nomeTitular),
											numero_cartao: btoa($scope.numeroCartao),
											mes: btoa($scope.mesValidade),
											ano: btoa($scope.anoValidade),
											codigo_seguranca: btoa($scope.codigoSeguranca),
											_token: $('meta[name="_token"]').attr('content')
										},
										type: "POST",
										success: function (response) {
						
											$("#progressoModalPGCartaoWeb")
												.css("width", "70%")
												.html("70%");
						
											if( response.indexOf('The request is invalid.') != -1 ) {
												//$("#dadosCartao").show();
												$("#pgInformacoesCartao").html(
													"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>The request is invalid. Não está sendo possível o envio de requisição de intermediação.<br>",							
												);
												$('#btn-close-modal-de-texto').removeAttr('disabled');
												$('#btn-close-modal-de-texto-2').removeAttr('disabled');
												return;
											}
						
											//response = '<meta http-equiv="refresh" content="0;';
						
											if( response.indexOf('<meta http-equiv="refresh" content="0;') != -1 ) {
												$("#pgInformacoesCartao").html(
													"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>Tempo de sessão expirado.<br>",							
												);
												window.location='/backoffice/faturas';
											}
						
											ret = JSON.parse(response);
						
											$("#progressoModalPGCartaoWeb").css("width", "80%").html("80%");
						
											switch (parseInt(ret.autorizacao)) {
						
												case 100200:
						
													$("#pgInformacoesCartao").html(
														"<strong><br>Pagamento com Cartão Web<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br><br>"+ret.mensagem,
													);
													$scope.vlCartaoWebDebitar = $scope.valorCartaoSALDOPREV;
													$scope.valorCartao = 0;
													$("#inputVLCartaWeb").val(0);
						
													setTimeout(function () {
														$('#modal-de-texto').modal('hide');
													}, tempoModal);		
						
													$('#btn-close-modal-de-texto').removeAttr('disabled');
													$('#btn-close-modal-de-texto-2').removeAttr('disabled');
													break;
						
												case 100501:
						
													//$("#dadosCartao").show();
													$("#pgInformacoesCartao").html(
														"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>"+ret.mensagem+"<br>",
													);
						
													$('#btn-close-modal-de-texto').removeAttr('disabled');
													$('#btn-close-modal-de-texto-2').removeAttr('disabled');
													break;
											} 
						
											$("#progressoModalPGCartaoWeb")
												.css("width", "100%")
												.html("100%");
											$scope.ajustaValoresPosPagamento();
										},
						
						  				error: function(jqXHR, textStatus, errorThrown){
						
						    				var msgError = textStatus + ": " + jqXHR.status + " " + errorThrown;
						
											$("#pgInformacoesCartao").html(
												"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU AO TENTAR EFETUAR O PAGAMENTO&nbsp;</span><br><br>"+msgError+"<br>",
											);
						
											$('#btn-close-modal-de-texto').removeAttr('disabled');
											$('#btn-close-modal-de-texto-2').removeAttr('disabled');
						  				}			
									});
								} 
							},
						});		
					} else if ($scope.valorCartaoSALDOPREV > 0 && $scope.valorCartaoJuros > 0) {
						//console.log('credit card');
						$("#modalPGCartaoWeb").show();
						$("#progressoModalPGCartaoWeb").css("width", "10%").html("10%");
			
						$scope.bandeira = 0;
			
						//verificando dados
			
						if ($scope.nomeTitular == "") {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o nome do titular do cartão!<br>",
							);
							return false;
						}
						if (!$scope.numeroCartao > 0) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o número do cartão!<br>",
							);
							return false;
						}
						if ($("select[name=bandeira]").val() > 0) {
							$scope.bandeira = $("select[name=bandeira]").val();
						}
						if (!$scope.bandeira > 0) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha uma bandeira!<br>",
							);
							return false;
						}			
						if (
							parseInt($scope.mesCard) == 0  ||
							parseInt($scope.anoCard) == 0  ||
							$scope.mesCard == '' ||
							$scope.anoCard == ''
						) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Selecione o mês e o ano de validade do cartão!<br>",
							);
							return false;
						}						
						if (!$scope.codigoSeguranca > 0) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o código de segurança do cartão!<br>",
							);
							return false;
						}			
						if (!$scope.parcelas > 0) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha a quantidade de parcelas!<br>",
							);
							return false;
						}
						if ($scope.valorCartaoSALDOPREV < 10) {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O pagamento mínimo é de 10 reais!<br>",
							);
							return false;
						}
						$("#progressoModalPGCartaoWeb").css("width", "40%").html("40%");
			
						if (parseInt($scope.mesCard) > 0) {
							$scope.mesValidade = $scope.mesCard;
						} else {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O mês do cartão deve ser informado!<br>",
							);
							return false;
						}
			
						if (parseInt($scope.anoCard) > 0) {
							$scope.anoValidade = $scope.anoCard;
						} else {
							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O ano do cartão deve ser informado!<br>",
							);				
							return false;
						}
			
						//fim da verificacao de dados
			
						$("#pgInformacoesCartao").html("<strong><br>Processando Cartão...</strong>");
						$("#progressoModalPGCartaoWeb").css("width", "50%").html("50%");
			
						/*
						if($scope.mesAnoCartao.length==5){
							$scope.mesAnoCartao = $scope.mesAnoCartao.split('/');
							if((parseInt($scope.mesAnoCartao[0])!="NaN") &&(parseInt($scope.mesAnoCartao[1])!="NaN")){
								$scope.mesValidade = $scope.mesAnoCartao[0];
								$scope.anoValidade = $scope.mesAnoCartao[1];
							}else{
								showNotification('alert-falha8'); 
								setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
								return false;
							}				
			
						}else{
							showNotification('alert-falha8'); 
							setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
							return false;
						}*/
			
						$('#btn-close-modal-de-texto').attr('disabled','disabled');
						$('#btn-close-modal-de-texto-2').attr('disabled','disabled');
			
						$.ajax({
			
							url: "/backoffice/faturas/processacartao",
							data: {
								valor_PGfatura: btoa($scope.valorCartaoSALDOPREV),
								valor: btoa($scope.valorCartaoJuros),
								valor_total: btoa($scope.valorCartaoJuros),
								fatura: btoa($scope.idFatura),
								bandeira: btoa($scope.bandeira),
								parcelas: btoa($scope.parcelas),
								nome_portador: btoa($scope.nomeTitular),
								numero_cartao: btoa($scope.numeroCartao),
								mes: btoa($scope.mesValidade),
								ano: btoa($scope.anoValidade),
								codigo_seguranca: btoa($scope.codigoSeguranca),
								_token: $('meta[name="_token"]').attr('content')
							},
							type: "POST",
							success: function (response) {
			
								$("#progressoModalPGCartaoWeb")
									.css("width", "70%")
									.html("70%");
			
								if( response.indexOf('The request is invalid.') != -1 ) {
									//$("#dadosCartao").show();
									$("#pgInformacoesCartao").html(
										"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>The request is invalid. Não está sendo possível o envio de requisição de intermediação.<br>",							
									);
									$('#btn-close-modal-de-texto').removeAttr('disabled');
									$('#btn-close-modal-de-texto-2').removeAttr('disabled');
									return;
								}
			
								//response = '<meta http-equiv="refresh" content="0;';
			
								if( response.indexOf('<meta http-equiv="refresh" content="0;') != -1 ) {
									$("#pgInformacoesCartao").html(
										"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>Tempo de sessão expirado.<br>",							
									);
									window.location='/backoffice/faturas';
								}
			
								ret = JSON.parse(response);
			
								$("#progressoModalPGCartaoWeb").css("width", "80%").html("80%");
			
								switch (parseInt(ret.autorizacao)) {
			
									case 100200:
			
										$("#pgInformacoesCartao").html(
											"<strong><br>Pagamento com Cartão Web<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br><br>"+ret.mensagem,
										);
										$scope.vlCartaoWebDebitar = $scope.valorCartaoSALDOPREV;
										$scope.valorCartao = 0;
										$("#inputVLCartaWeb").val(0);
			
										setTimeout(function () {
											$('#modal-de-texto').modal('hide');
										}, tempoModal);		
			
										$('#btn-close-modal-de-texto').removeAttr('disabled');
										$('#btn-close-modal-de-texto-2').removeAttr('disabled');
										break;
			
									case 100501:
			
										//$("#dadosCartao").show();
										$("#pgInformacoesCartao").html(
											"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>"+ret.mensagem+"<br>",
										);
			
										$('#btn-close-modal-de-texto').removeAttr('disabled');
										$('#btn-close-modal-de-texto-2').removeAttr('disabled');
										break;
								} 
			
								$("#progressoModalPGCartaoWeb")
									.css("width", "100%")
									.html("100%");
								$scope.ajustaValoresPosPagamento();
							},
			
			  				error: function(jqXHR, textStatus, errorThrown){
			
			    				var msgError = textStatus + ": " + jqXHR.status + " " + errorThrown;
			
								$("#pgInformacoesCartao").html(
									"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU AO TENTAR EFETUAR O PAGAMENTO&nbsp;</span><br><br>"+msgError+"<br>",
								);
			
								$('#btn-close-modal-de-texto').removeAttr('disabled');
								$('#btn-close-modal-de-texto-2').removeAttr('disabled');
			  				}			
						});
					} 
					
				},
			});
		} 
		
		
		
		
		
		

		else if ($scope.valorMoneySALDOPREV > 0) {
			//console.log('AKPONITS FROM AKPONTS');
			$("#modalPGAKMoney").show();
			$("#progressoModalPGAKMoney").css("width", "10%").html("10%");

			$("#pgInformacoesM").html("<strong><br>Processando Ak Points...</strong>");
			$("#progressoModalPGAKMoney").css("width", "30%").html("30%");

			$('#btn-close-modal-de-texto').attr('disabled','disabled');
			$('#btn-close-modal-de-texto-2').attr('disabled','disabled');

			$.ajax({
				url: "/backoffice/faturas/processamoney",
				data: {
					money: $scope.valorMoneySALDOPREV,
					idFatura: $scope.idFatura,
					_token: $('meta[name="_token"]').attr('content')
				},
				type: "POST",
				success: function (response) {
					$("#progressoModalPGAKMoney")
						.css("width", "60%")
						.html("60%");
					switch (parseInt(response)) {

						case 100200:

							$("#pgInformacoesM").html(
								"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br>",
							);
							setTimeout(function () {
								$('#modal-de-texto').modal('hide');
							}, tempoModal);

							$scope.vlAkMoneyDevitar = $scope.valorMoneySALDOPREV;
							break;

						case 100501:

							$("#pgInformacoesM").html(
								"</strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;SALDO INSUFICIENTE&nbsp;</span><br>",
							);
							break;

						case 100502:

							$("#pgInformacoesM").html(
								"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FATURA JÁ ESTÁ PAGA&nbsp;</span><br>",
							);
							break;

						case 100500:

							$("#pgInformacoesM").html(
								"<strong><br>Pagamento com Ak Points<br><br>Resultado:</strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU, VERIFIQUE AS INFORMAÇÕES&nbsp;</span><br>",
							);
							break;
					} 

					$("#progressoModalPGAKMoney")
						.css("width", "100%")
						.html("100%");
					$scope.ajustaValoresPosPagamento("AK_POINTS");

					$('#btn-close-modal-de-texto').removeAttr('disabled');
					$('#btn-close-modal-de-texto-2').removeAttr('disabled');	
					
					//PLACE CREDIT CARD 3
					if ($scope.valorCartaoSALDOPREV > 0 && $scope.valorCartaoJuros > 0) {
							//console.log('CREDIT CARD FROM AKPONTS');
							$("#modalPGCartaoWeb").show();
							$("#progressoModalPGCartaoWeb").css("width", "10%").html("10%");
				
							$scope.bandeira = 0;
				
							//verificando dados
				
							if ($scope.nomeTitular == "") {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o nome do titular do cartão!<br>",
								);
								return false;
							}
							if (!$scope.numeroCartao > 0) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o número do cartão!<br>",
								);
								return false;
							}
							if ($("select[name=bandeira]").val() > 0) {
								$scope.bandeira = $("select[name=bandeira]").val();
							}
							if (!$scope.bandeira > 0) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha uma bandeira!<br>",
								);
								return false;
							}			
							if (
								parseInt($scope.mesCard) == 0  ||
								parseInt($scope.anoCard) == 0  ||
								$scope.mesCard == '' ||
								$scope.anoCard == ''
							) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Selecione o mês e o ano de validade do cartão!<br>",
								);
								return false;
							}						
							if (!$scope.codigoSeguranca > 0) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o código de segurança do cartão!<br>",
								);
								return false;
							}			
							if (!$scope.parcelas > 0) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha a quantidade de parcelas!<br>",
								);
								return false;
							}
							if ($scope.valorCartaoSALDOPREV < 10) {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O pagamento mínimo é de 10 reais!<br>",
								);
								return false;
							}
							$("#progressoModalPGCartaoWeb").css("width", "40%").html("40%");
				
							if (parseInt($scope.mesCard) > 0) {
								$scope.mesValidade = $scope.mesCard;
							} else {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O mês do cartão deve ser informado!<br>",
								);
								return false;
							}
				
							if (parseInt($scope.anoCard) > 0) {
								$scope.anoValidade = $scope.anoCard;
							} else {
								$("#pgInformacoesCartao").html(
									"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O ano do cartão deve ser informado!<br>",
								);				
								return false;
							}
				
							//fim da verificacao de dados
				
							$("#pgInformacoesCartao").html("<strong><br>Processando Cartão...</strong>");
							$("#progressoModalPGCartaoWeb").css("width", "50%").html("50%");
				
							/*
							if($scope.mesAnoCartao.length==5){
								$scope.mesAnoCartao = $scope.mesAnoCartao.split('/');
								if((parseInt($scope.mesAnoCartao[0])!="NaN") &&(parseInt($scope.mesAnoCartao[1])!="NaN")){
									$scope.mesValidade = $scope.mesAnoCartao[0];
									$scope.anoValidade = $scope.mesAnoCartao[1];
								}else{
									showNotification('alert-falha8'); 
									setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
									return false;
								}				
				
							}else{
								showNotification('alert-falha8'); 
								setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
								return false;
							}*/
				
							$('#btn-close-modal-de-texto').attr('disabled','disabled');
							$('#btn-close-modal-de-texto-2').attr('disabled','disabled');
				
							$.ajax({
				
								url: "/backoffice/faturas/processacartao",
								data: {
									valor_PGfatura: btoa($scope.valorCartaoSALDOPREV),
									valor: btoa($scope.valorCartaoJuros),
									valor_total: btoa($scope.valorCartaoJuros),
									fatura: btoa($scope.idFatura),
									bandeira: btoa($scope.bandeira),
									parcelas: btoa($scope.parcelas),
									nome_portador: btoa($scope.nomeTitular),
									numero_cartao: btoa($scope.numeroCartao),
									mes: btoa($scope.mesValidade),
									ano: btoa($scope.anoValidade),
									codigo_seguranca: btoa($scope.codigoSeguranca),
									_token: $('meta[name="_token"]').attr('content')
								},
								type: "POST",
								success: function (response) {
				
									$("#progressoModalPGCartaoWeb")
										.css("width", "70%")
										.html("70%");
				
									if( response.indexOf('The request is invalid.') != -1 ) {
										//$("#dadosCartao").show();
										$("#pgInformacoesCartao").html(
											"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>The request is invalid. Não está sendo possível o envio de requisição de intermediação.<br>",							
										);
										$('#btn-close-modal-de-texto').removeAttr('disabled');
										$('#btn-close-modal-de-texto-2').removeAttr('disabled');
										return;
									}
				
									//response = '<meta http-equiv="refresh" content="0;';
				
									if( response.indexOf('<meta http-equiv="refresh" content="0;') != -1 ) {
										$("#pgInformacoesCartao").html(
											"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>Tempo de sessão expirado.<br>",							
										);
										window.location='/backoffice/faturas';
									}
				
									ret = JSON.parse(response);
				
									$("#progressoModalPGCartaoWeb").css("width", "80%").html("80%");
				
									switch (parseInt(ret.autorizacao)) {
				
										case 100200:
				
											$("#pgInformacoesCartao").html(
												"<strong><br>Pagamento com Cartão Web<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br><br>"+ret.mensagem,
											);
											$scope.vlCartaoWebDebitar = $scope.valorCartaoSALDOPREV;
											$scope.valorCartao = 0;
											$("#inputVLCartaWeb").val(0);
				
											setTimeout(function () {
												$('#modal-de-texto').modal('hide');
											}, tempoModal);		
				
											$('#btn-close-modal-de-texto').removeAttr('disabled');
											$('#btn-close-modal-de-texto-2').removeAttr('disabled');
											break;
				
										case 100501:
				
											//$("#dadosCartao").show();
											$("#pgInformacoesCartao").html(
												"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>"+ret.mensagem+"<br>",
											);
				
											$('#btn-close-modal-de-texto').removeAttr('disabled');
											$('#btn-close-modal-de-texto-2').removeAttr('disabled');
											break;
									} 
				
									$("#progressoModalPGCartaoWeb")
										.css("width", "100%")
										.html("100%");
									$scope.ajustaValoresPosPagamento();
								},
				
				  				error: function(jqXHR, textStatus, errorThrown){
				
				    				var msgError = textStatus + ": " + jqXHR.status + " " + errorThrown;
				
									$("#pgInformacoesCartao").html(
										"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU AO TENTAR EFETUAR O PAGAMENTO&nbsp;</span><br><br>"+msgError+"<br>",
									);
				
									$('#btn-close-modal-de-texto').removeAttr('disabled');
									$('#btn-close-modal-de-texto-2').removeAttr('disabled');
				  				}			
							});
						} 
				},
			});		
		} 

		else if ($scope.valorCartaoSALDOPREV > 0 && $scope.valorCartaoJuros > 0) {
			//console.log("CREDIT CARD FROM CREDIT CARD");
			$("#modalPGCartaoWeb").show();
			$("#progressoModalPGCartaoWeb").css("width", "10%").html("10%");

			$scope.bandeira = 0;

			//verificando dados

			if ($scope.nomeTitular == "") {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o nome do titular do cartão!<br>",
				);
				return false;
			}
			if (!$scope.numeroCartao > 0) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o número do cartão!<br>",
				);
				return false;
			}
			if ($("select[name=bandeira]").val() > 0) {
				$scope.bandeira = $("select[name=bandeira]").val();
			}
			if (!$scope.bandeira > 0) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha uma bandeira!<br>",
				);
				return false;
			}			
			if (
				parseInt($scope.mesCard) == 0  ||
				parseInt($scope.anoCard) == 0  ||
				$scope.mesCard == '' ||
				$scope.anoCard == ''
			) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Selecione o mês e o ano de validade do cartão!<br>",
				);
				return false;
			}						
			if (!$scope.codigoSeguranca > 0) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Digite o código de segurança do cartão!<br>",
				);
				return false;
			}			
			if (!$scope.parcelas > 0) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>Escolha a quantidade de parcelas!<br>",
				);
				return false;
			}
			if ($scope.valorCartaoSALDOPREV < 10) {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O pagamento mínimo é de 10 reais!<br>",
				);
				return false;
			}
			$("#progressoModalPGCartaoWeb").css("width", "40%").html("40%");

			if (parseInt($scope.mesCard) > 0) {
				$scope.mesValidade = $scope.mesCard;
			} else {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O mês do cartão deve ser informado!<br>",
				);
				return false;
			}

			if (parseInt($scope.anoCard) > 0) {
				$scope.anoValidade = $scope.anoCard;
			} else {
				$("#pgInformacoesCartao").html(
					"<strong><br>Pagamento com Cartão Web<br><br></strong> <span style='color:#004085; background-color:#cce5ff; border-radius: 6px; border: 2px solid #004085;'>&nbsp;INFORMAÇÃO!&nbsp;</span><br><br>O ano do cartão deve ser informado!<br>",
				);				
				return false;
			}

			//fim da verificacao de dados

			$("#pgInformacoesCartao").html("<strong><br>Processando Cartão...</strong>");
			$("#progressoModalPGCartaoWeb").css("width", "50%").html("50%");

			/*
			if($scope.mesAnoCartao.length==5){
				$scope.mesAnoCartao = $scope.mesAnoCartao.split('/');
				if((parseInt($scope.mesAnoCartao[0])!="NaN") &&(parseInt($scope.mesAnoCartao[1])!="NaN")){
					$scope.mesValidade = $scope.mesAnoCartao[0];
					$scope.anoValidade = $scope.mesAnoCartao[1];
				}else{
					showNotification('alert-falha8'); 
					setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
					return false;
				}				

			}else{
				showNotification('alert-falha8'); 
				setTimeout(function(){ hideNotification('alert-falha8'); }, 3000);
				return false;
			}*/

			$('#btn-close-modal-de-texto').attr('disabled','disabled');
			$('#btn-close-modal-de-texto-2').attr('disabled','disabled');

			$.ajax({

				url: "/backoffice/faturas/processacartao",
				data: {
					valor_PGfatura: btoa($scope.valorCartaoSALDOPREV),
					valor: btoa($scope.valorCartaoJuros),
					valor_total: btoa($scope.valorCartaoJuros),
					fatura: btoa($scope.idFatura),
					bandeira: btoa($scope.bandeira),
					parcelas: btoa($scope.parcelas),
					nome_portador: btoa($scope.nomeTitular),
					numero_cartao: btoa($scope.numeroCartao),
					mes: btoa($scope.mesValidade),
					ano: btoa($scope.anoValidade),
					codigo_seguranca: btoa($scope.codigoSeguranca),
					_token: $('meta[name="_token"]').attr('content')
				},
				type: "POST",
				success: function (response) {

					$("#progressoModalPGCartaoWeb")
						.css("width", "70%")
						.html("70%");

					if( response.indexOf('The request is invalid.') != -1 ) {
						//$("#dadosCartao").show();
						$("#pgInformacoesCartao").html(
							"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>The request is invalid. Não está sendo possível o envio de requisição de intermediação.<br>",							
						);
						$('#btn-close-modal-de-texto').removeAttr('disabled');
						$('#btn-close-modal-de-texto-2').removeAttr('disabled');
						return;
					}

					//response = '<meta http-equiv="refresh" content="0;';

					if( response.indexOf('<meta http-equiv="refresh" content="0;') != -1 ) {
						$("#pgInformacoesCartao").html(
							"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Inconsistência: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>Tempo de sessão expirado.<br>",							
						);
						window.location='/backoffice/faturas';
					}

					ret = JSON.parse(response);

					$("#progressoModalPGCartaoWeb").css("width", "80%").html("80%");

					switch (parseInt(ret.autorizacao)) {

						case 100200:

							$("#pgInformacoesCartao").html(
								"<strong><br>Pagamento com Cartão Web<br><br>Resultado:</strong> <span style='color:#2A7D15; background-color:#E8F1E6; border-radius: 6px; border: 2px solid #2A7D15;'>&nbsp;PAGO COM SUCESSO&nbsp;</span><br><br>"+ret.mensagem,
							);
							$scope.vlCartaoWebDebitar = $scope.valorCartaoSALDOPREV;
							$scope.valorCartao = 0;
							$("#inputVLCartaWeb").val(0);

							setTimeout(function () {
								$('#modal-de-texto').modal('hide');
							}, tempoModal);		

							$('#btn-close-modal-de-texto').removeAttr('disabled');
							$('#btn-close-modal-de-texto-2').removeAttr('disabled');
							break;

						case 100501:

							//$("#dadosCartao").show();
							$("#pgInformacoesCartao").html(
								"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;PAGAMENTO NÃO EFETUADO&nbsp;</span><br><br>"+ret.mensagem+"<br>",
							);

							$('#btn-close-modal-de-texto').removeAttr('disabled');
							$('#btn-close-modal-de-texto-2').removeAttr('disabled');
							break;
					} 

					$("#progressoModalPGCartaoWeb")
						.css("width", "100%")
						.html("100%");
					$scope.ajustaValoresPosPagamento();
				},

  				error: function(jqXHR, textStatus, errorThrown){

    				var msgError = textStatus + ": " + jqXHR.status + " " + errorThrown;

					$("#pgInformacoesCartao").html(
						"<br><strong>Pagamento com Cartão Web</font></strong><strong><br><BR>Resultado: </strong> <span style='color:#B71414; background-color:#FCE9E9; border-radius: 6px; border: 2px solid #B71414;'>&nbsp;FALHOU AO TENTAR EFETUAR O PAGAMENTO&nbsp;</span><br><br>"+msgError+"<br>",
					);

					$('#btn-close-modal-de-texto').removeAttr('disabled');
					$('#btn-close-modal-de-texto-2').removeAttr('disabled');
  				}			
			});
		} 
	};

	$scope.valorFaturaAberto = 0;
	$scope.retornaValorFatura = function () {

		if ($scope.valorAberto == 0) {
			$("#vlA").html(0);
			$("#vlT").html(0);
			$("#vlP").html(0);
			$("#vlSaldoC").html(0);		
			$("#vlSaldoM").html(0);		
			$("#vlLimit").html(0);		
			$("#bntPagarPagamentos").remove();

			// goPushDataLayer();

			if($scope.isPagamento==1 || $scope.isPagamento==2) {
				setTimeout(function () {
					if($scope.isConsumer==0) {
						window.location = "/backoffice/faturas/detalhes/" + $scope.idFatura + "/0";
					}
					else {
						window.location = "/minhaconta/faturas/detalhes/" + $scope.idFatura + "/0";
					}
				}, 3000);				
			}

		} else {
			$scope.valorFaturaAberto = arredondar(
				$scope.valorAberto -
					($scope.valorCreditos +
						$scope.valorMoney +
						$scope.valorCartao),
				2,
			);

			$("#vlA").html(
				$scope.valorAberto.toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);
			$("#vlT").html(
				arredondar(
					$scope.valorMoneySALDOPREV +
						$scope.valorCreditosSALDOPREV +
						$scope.valorCartaoSALDOPREV,
					2,
				).toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);
			$("#vlP").html(
				$scope.valorFaturaAberto.toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);
			$("#vlSaldoC").html(
				$scope.saldoCreditos.toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);		
			$("#vlSaldoM").html(
				$scope.saldoMoney.toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);		
			$("#vlLimit").html(
				$scope.limitadorValorMaximoQuePodePagarComBonus.toLocaleString("pt-br", {
					style: "currency",
					currency: "BRL",
				}),
			);						
		}
		//$scope.valorCartao = 0;
		//$("#inputVLCartaWeb").val(0);
		$("#modalPGBackground").css("background", "white");

		if (
			!(
				$scope.valorMoneySALDOPREV > 0 ||
				$scope.valorCreditosSALDOPREV > 0 ||
				$scope.valorCartaoSALDOPREV > 0
			)
		) {
			$("#msnPagamentoTitulo").html(
				"<h3>Por favor, insira as informações para pagamento!</h3>",
			);
		} else {
			$("#msnPagamentoTitulo").html("<h3>Pagamento Processado!</h3>");
		}

		//tirando o indicador
		$("#progressoModalPGAKCreditos, #progressoModalPGAKMoney, #progressoModalPGCartaoWeb",).removeClass("progress-indicating"); //.addClass( "active" );

		//$("#pgInformacoesC, #pgInformacoesM, #pgInformacoesCartao").css("font-size","20px").css("margin-top","20px").css("color","white");

		// $("#fecharModalPagamento").show();
	};

	$scope.ajustaValoresPosPagamento = function (paymentType = null) {
		var valorDebitar = 0;

		if (paymentType == "AK_CREDITOS") {
			//creditos
			valorDebitar += $scope.vlAkCreditosDebitar;

			$scope.saldoCreditos = arredondar(
				$scope.saldoCreditos - $scope.vlAkCreditosDebitar,
				2,
			);

			$scope.limitadorValorMaximoQuePodePagarComBonus = arredondar(
				$scope.limitadorValorMaximoQuePodePagarComBonus -
					$scope.vlAkCreditosDebitar,
				2,
			);
			$scope.valorCreditosSALDOPREV = 0;
			$scope.valorCreditos = 0;
			$("#inputVLCreditos").val(0).trigger("change");
		}

		if (paymentType == "AK_POINTS") {
			//money
			valorDebitar += $scope.vlAkMoneyDevitar;
			$scope.saldoMoney = arredondar(
				$scope.saldoMoney - $scope.vlAkMoneyDevitar,
				2,
			);
			$scope.limitadorValorMaximoQuePodePagarComBonus = arredondar(
				$scope.limitadorValorMaximoQuePodePagarComBonus -
					$scope.vlAkMoneyDevitar,
				2,
			);
			$scope.valorMoneySALDOPREV = 0;
			$scope.valorMoney = 0;
			$("#inputVLMoney").val(0).trigger("change");
		}

		$scope.vlAkCreditosDebitar = 0;
		$scope.vlAkMoneyDevitar = 0;

		//cartao
		valorDebitar += $scope.vlCartaoWebDebitar;

		$scope.vlCartaoWebDebitar = 0;

		//acertando valor em aberto
		$scope.valorAberto = arredondar($scope.valorAberto - valorDebitar, 2);

		$scope.validacaoValores();
	};
});

//FIM CONTROLLER DA PAGAMENTOS
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//INICIO CONTROLLER DE SAQUE
angular.module("Backoffice").controller("saque", function ($scope) {
	$scope.taxa = 0;
	$scope.taxaPtBr = "0,00";
	$scope.saldo = 0;
	$scope.idCadastro = 0;
	$scope.minimo = 0;
	$scope.valorSacar = 0;
	$scope.valorSacarPtBr = "0,00";
	$scope.valorRetirar = 0;
	$scope.valorRetirarPtBr = "0,00";
	$scope.valorReceber = 0;
	$scope.valorReceberPtBr = "0,00";
	$scope.valorMaximo = 0;
	$scope.apto = 100500;
	$scope.dependentes = 0;
	$scope.tipoPessoa = 0;
	$scope.recolheInss = null;
	$scope.valorRecolheInss = null;
	$scope.pisCnpj = null;
	$scope.inss = 0.0;
	$scope.debitoTotal = 0.0;
	$scope.notaFiscal = null;
	$scope.msgNaoApto = "";

	//apenas para exibição na tela
	$scope.inssPtBr = "0,00";
	$scope.debitoTotalPtBr = "0,00";

	//dados previdencia social
	$scope.tetoMaximo = 0;
	$scope.percentual = 0;
	$scope.descontoMaximo = 0;

	//dados imposto de renda
	$scope.tabelaImpostoDeRenda = [];
	$scope.deducaoPorDependentes = 0;
	$scope.valorBaseCalculoIR = 0;
	$scope.PercentualIR = 0;
	$scope.valorDeducaoDependentesIR = 0;
	$scope.valorIR = 0;
	$scope.valorIrPtBr = "0,00";

	$scope.preCarregamentoInformacoesSaque = function (
		taxa,
		saldo,
		idCadastro,
		minimo,
		apto,
		tipoPessoa,
		dependentes,
		pisCnpj,
		recolheInss,
		recolheInssValor,
		msgNaoApto,
	) {
		$scope.taxa = parseFloat(taxa);
		$scope.taxaPtBr = $scope.number_format(parseFloat(taxa));
		$scope.saldo = parseFloat(saldo);
		$scope.idCadastro = idCadastro;
		$scope.minimo = parseFloat(minimo);
		$scope.valorMaximo = arredondar($scope.saldo, 2);
		$scope.apto = apto;
		$scope.tipoPessoa = String(tipoPessoa);
		$scope.dependentes = dependentes;
		$scope.pisCnpj = pisCnpj;
		$scope.recolheInss = String(recolheInss);
		$scope.valorRecolheInss = parseFloat(recolheInssValor);
		$scope.msgNaoApto = msgNaoApto;
	};

	/**
	 * Carrega informações a serem consideradas no calculo da previdencia social
	 */
	$scope.preCarregamentoInformacoesPrevidenciaSocial = function (
		tetoMaximo,
		percentual,
		descontoMaximo,
	) {
		$scope.tetoMaximo = parseFloat(tetoMaximo);
		$scope.percentual = arredondar(parseFloat(percentual) / 100, 2);
		$scope.descontoMaximo = parseFloat(descontoMaximo);
	};

	$scope.preCarregamentoInformacoesImpostoDeRenda = function () {
		//get enviar saque
		$.ajax({
			url: "/master/pagamentos/retornadadosimpostoderenda",
			dataType: "json",
			type: "POST",
			success: function (response) {
				for (indexTabela in response) {
					$scope.tabelaImpostoDeRenda[indexTabela] = [];
					$scope.tabelaImpostoDeRenda[indexTabela]["valor_de"] =
						parseFloat(response[indexTabela]["valor_de"]);
					$scope.tabelaImpostoDeRenda[indexTabela]["valor_ate"] =
						parseFloat(response[indexTabela]["valor_ate"]);
					$scope.tabelaImpostoDeRenda[indexTabela]["percentual"] =
						parseFloat(response[indexTabela]["percentual"] / 100);
					$scope.tabelaImpostoDeRenda[indexTabela][
						"deducao_dependentes"
					] = parseFloat(
						response[indexTabela]["deducao_dependentes"],
					);
					$scope.tabelaImpostoDeRenda[indexTabela][
						"deducao_parcela"
					] = parseFloat(response[indexTabela]["deducao_parcela"]);
					$scope.deducaoPorDependentes =
						$scope.tabelaImpostoDeRenda[indexTabela][
							"deducao_dependentes"
						];
				}
			},
		});
	};

	$scope.controlarValorSaque = function () {
		if ($scope.valorSacar == undefined || $scope.valorSacar == 0) {
			$scope.inss = 0;
			$scope.inssPtBr = $scope.number_format(0);
			$scope.valorSacarPtBr = $scope.number_format(0);
			$scope.valorReceber = 0;
			$scope.ValorReceberPtBr = $scope.number_format(0);
			$scope.valorRetirar = 0;
			$scope.ValorRetirarPtBr = $scope.number_format(0);
			return false;
		}

		$scope.valorRetirar = arredondar($scope.valorSacar - $scope.taxa, 2);
		$scope.valorRetirarPtBr = $scope.number_format($scope.valorRetirar);

		$scope.valorSacarPtBr = $scope.number_format($scope.valorSacar);

		if ($("#valorSacarAkMoney").val() > $scope.valorMaximo) {
			$scope.valorSacar = arredondar($scope.valorMaximo, 2);
			$("#valorSacarAkMoney").val($scope.valorSacar);
			$scope.valorRetirar = $scope.valorSacar;
			$scope.valorRetirarPtBr = $scope.number_format($scope.valorRetirar);
		}

		//calula só se for pessoa física
		if ($scope.tipoPessoa == 1) {
			$scope.calculaINSS();
			$scope.calculaIR();
		}

		$scope.calculaValorReceber();
	};

	$scope.toogleRecolheInss = function () {
		if ($scope.recolheInss == 1) {
			$("#valorRecolheInss").removeAttr("readonly");
			$("#valorRecolheInss").removeAttr("disabled");
			$("#valorRecolheInss").focus();
		} else {
			$("#valorRecolheInss").attr("readonly", "readonly");
			$("#valorRecolheInss").attr("disabled", "disabled");
			$scope.valorRecolheInss = 0;
		}
	};

	$scope.controlaValorRecolheInss = function () {
		$scope.valorRecolheInss = arredondar($scope.valorRecolheInss, 2);

		if ($scope.valorRecolheInss > $scope.descontoMaximo) {
			$scope.valorRecolheInss = $scope.descontoMaximo;
		}

		if ($scope.valorRecolheInss == 0) {
			$scope.valorRecolheInss = null;
		}
	};

	$scope.calculaINSS = function () {
		if ($scope.valorRetirar >= $scope.tetoMaximo) {
			$scope.inss = $scope.descontoMaximo;

			if ($scope.recolheInss == 1) {
				$scope.inss = parseFloat(
					arredondar($scope.inss - $scope.valorRecolheInss, 2),
				);
			}

			$scope.inssPtBr = $scope.number_format($scope.inss);
		} else {
			$scope.inss = parseFloat(
				arredondar($scope.percentual * $scope.valorRetirar, 2),
			);

			if ($scope.inss + $scope.valorRecolheInss > $scope.descontoMaximo) {
				valorPassouTetoMaximo = parseFloat(
					arredondar(
						$scope.inss +
							$scope.valorRecolheInss -
							$scope.descontoMaximo,
						2,
					),
				);
				$scope.inss = parseFloat(
					arredondar($scope.inss - valorPassouTetoMaximo, 2),
				);
			}

			$scope.inssPtBr = $scope.number_format($scope.inss);
		}
	};

	$scope.calculaIR = function () {
		$scope.valorDeducaoDependentesIR = 0;
		$scope.valorBaseCalculoIR = 0;
		$scope.valorIR = 0;
		$scope.valorIrPtBr = "0,00";

		$scope.valorDeducaoDependentesIR = $scope.calculaDeducaoDependentes(
			$scope.dependentes,
			$scope.deducaoPorDependentes,
		);
		$scope.valorBaseCalculoIR = arredondar(
			$scope.valorRetirar -
				$scope.inss -
				$scope.valorDeducaoDependentesIR,
			2,
		);

		for (condicao in $scope.tabelaImpostoDeRenda) {
			if (
				$scope.valorBaseCalculoIR >=
					$scope.tabelaImpostoDeRenda[condicao]["valor_de"] &&
				$scope.valorBaseCalculoIR <=
					$scope.tabelaImpostoDeRenda[condicao]["valor_ate"]
			) {
				$scope.percentualIR =
					$scope.tabelaImpostoDeRenda[condicao]["percentual"];
				impostoDeRenda =
					$scope.valorBaseCalculoIR * $scope.percentualIR;
				$scope.valorIR = arredondar(
					$scope.valorBaseCalculoIR * $scope.percentualIR -
						$scope.tabelaImpostoDeRenda[condicao][
							"deducao_parcela"
						],
					2,
				);
				$scope.valorIrPtBr = $scope.number_format($scope.valorIR);
			}
		}
	};

	$scope.calculaValorReceber = function () {
		$scope.valorReceber = arredondar(
			$scope.valorRetirar - $scope.inss - $scope.valorIR,
			2,
		);
		$scope.valorReceberPtBr = $scope.number_format($scope.valorReceber);
	};

	$scope.calculaDeducaoDependentes = function (
		qtdDependentes,
		deducaoPorDependente,
	) {
		return arredondar(qtdDependentes * deducaoPorDependente, 2);
	};

	$scope.controlarSolicitacaoSaque = function (status) {
		// const divStep1 = document.querySelector('div#step-1'); $('div#step-1')
		// const divStep2 = document.querySelector('div#step-2');
		// const divStep3 = document.querySelector('div#step-3');
		// const indicatorStep1 = document.querySelector('div#indicator-step-1');
		// const indicatorStep2 = document.querySelector('div#indicator-step-2');
		// const indicatorStep3 = document.querySelector('div#indicator-step-3');
		if (status != 0) {
			$scope.controlarValorSaque();
		}

		if ($scope.apto == 100500) {
			// showNotificacao('','','notificacoesSaque','tituloNotificacaoSaque','corpoNotificacaoSaque');
			showNotificacao(
				"",
				"Infelizmente você não está apto a solicitar saque. </br></br>"+$scope.msgNaoApto+"</br></br>Por favor revise os seus dados cadastrais ou ligue na nossa central de atendimento.",
				"notificacoesSaque",
				"tituloNotificacaoSaque",
				"corpoNotificacaoSaque",
			);
			// notificacaoPerido("Infelizmente você não esta apto a solicitar saque, </br> por favor revise os seus dados cadastrais ou ligue na nossa central de atendimento.");
			return;
		}

		if (status == 0) {
			if ($scope.tipoPessoa != "1" && $scope.tipoPessoa != "2") {
				showNotificacao(
					"",
					"Informe se você é pessoa física ou pessoa jurídica!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("Informe se você é pessoa física ou pessoa jurídica!");
				return false;
			}

			if (!Number.isInteger($scope.dependentes)) {
				showNotificacao(
					"",
					"Informe quantos dependentes você possui!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("Informe quantos dependentes você possui!");
				return false;
			}

			if (
				$scope.pisCnpj == null ||
				$scope.pisCnpj == "" ||
				String($scope.pisCnpj).length < 9
			) {
				showNotificacao(
					"",
					"Informe seu PIS ou CNPJ corretamente!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("Informe seu PIS ou CNPJ corretamente!");
				return false;
			}

			if ($scope.recolheInss == "null" || $scope.recolheInss == "") {
				showNotificacao(
					"",
					"Informe se você já recolhe INSS!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("Informe se você já recolhe INSS!");
				return false;
			}

			if (
				$scope.valorRecolheInss == null ||
				isNaN($scope.valorRecolheInss)
			) {
				showNotificacao(
					"",
					"Informe o valor que você já recolhe de INSS!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("Informe o valor que você já recolhe de INSS!");
				return false;
			}

			//get enviar saque
			$.ajax({
				url: "/master/cadastros/setimpostos",
				data: {
					tipoPessoa: $scope.tipoPessoa,
					dependentes: $scope.dependentes,
					pisCnpj: $scope.pisCnpj,
					recolheInss: $scope.recolheInss,
					recolheInssValor: $scope.valorRecolheInss,
				},
				dataType: "json",
				type: "POST",
				success: function (response) {
					if (response["type"] == "success") {
						$("div#step-1").addClass("hidden");
						$("div#step-2").removeClass("hidden");
						$("div#step-3").addClass("hidden");
						$("div#indicator-step-1").removeClass("is-active");
						$("div#indicator-step-1").addClass("is-finished");
						$("div#indicator-step-2").addClass("is-active");

						// $("#saqueZeroPasso").hide();
						// $("#saquePrimeiroPasso").show();
						// $("#Step0Saque").removeClass( "default" ).addClass( "done" );
						// $("#Step1Saque").removeClass( "default" ).addClass( "active" );

						if ($scope.tipoPessoa == 2) {
							$(".notaFiscal").show();
						} else {
							$(".notaFiscal").hide();
						}
					} else {
						showNotificacao(
							"",
							"Erro ao salvar os dados. <br> Por favor, ligue na nossa central de atendimento!",
							"notificacoesSaque",
							"tituloNotificacaoSaque",
							"corpoNotificacaoSaque",
						);
						// notificacaoPerido("Erro ao salvar os dados. <br> Por favor, ligue na nossa central de atendimento!");
						return false;
					}
				},
			});
		} else if (status == 1) {
			if (
				$scope.valorSacar >= $scope.minimo &&
				$scope.valorSacar <= $scope.valorMaximo
			) {
				if ($scope.tipoPessoa == 2 && $(".fileNfe").val() == "") {
					showNotificacao(
						"",
						"Informe a Nota Fiscal referente ao valor a retirar!",
						"notificacoesSaque",
						"tituloNotificacaoSaque",
						"corpoNotificacaoSaque",
					);
					// notificacaoPerido("Informe a Nota Fiscal referente ao valor a retirar!");
					return false;
				}

				// $("#saquePrimeiroPasso").hide();
				// $("#saqueTerceiroPasso").hide();

				$("div#step-1").addClass("hidden");
				$("div#step-2").addClass("hidden");
				$("div#step-3").removeClass("hidden");
				$("div#indicator-step-2").removeClass("is-active");
				$("div#indicator-step-2").addClass("is-finished");
				$("div#indicator-step-3").addClass("is-active");

				//vai pro step 2
				// $("#saqueSegundoPasso").show();
				// $("#Step2Saque").removeClass( "default" ).addClass( "active" );
				// $("#Step3Saque").removeClass( "active" ).addClass( "default" );
				// $("#Step1Saque").removeClass( "active" ).addClass( "done" );
			} else {
				showNotificacao(
					"",
					"O valor minimo de saque é R$ " + $scope.minimo + "!",
					"notificacoesSaque",
					"tituloNotificacaoSaque",
					"corpoNotificacaoSaque",
				);
				// notificacaoPerido("O valor minimo de saque é R$ "+$scope.minimo+"!");
			}
		} else if (status == 2) {
			$("#saqueSegundoPasso").hide();
			$("#saqueTerceiroPasso").hide();

			//vai pro step 1
			$("div#step-1").removeClass("hidden");
			$("div#step-2").addClass("hidden");
			$("div#step-3").addClass("hidden");
			$("div#indicator-step-1").addClass("is-active");
			$("div#indicator-step-1").removeClass("is-finished");
			$("div#indicator-step-2").removeClass("is-active");

			// $("#saquePrimeiroPasso").show();
			// $("#Step1Saque").removeClass( "default" ).addClass( "active" );
			// $("#Step2Saque, #Step3Saque").removeClass( "active" ).addClass( "default" );
		} else if (status == 3) {
			$("#progressoModalSaque").css("width", "10%").html("10%");

			$("#saquePrimeiroPasso").hide();
			$("#saqueSegundoPasso").hide();

			//vai pro step 3

			$("#msg-success").removeClass("hidden");
			$("div.wrapper-btn-next-step-3").addClass("hidden");
			$("div#indicator-step-3").removeClass("is-active");
			$("div#indicator-step-3").addClass("is-finished");

			// $("#saqueTerceiroPasso").show();
			// $("#Step3Saque").removeClass( "default" ).addClass( "active" );
			// $("#Step1Saque, #Step2Saque").removeClass( "active" ).addClass( "done" );

			// $("#progressoModalSaque").css("width","30%").html("30%");

			var formData = new FormData();

			if ($scope.tipoPessoa == 2) {
				var file_data = $(".fileNfe").prop("files")[0];
				formData.append("file", file_data);
			}

			formData.append("valorsaque", $scope.valorSacar);

			//get enviar saque
			$.ajax({
				url: "/master/pagamentos/saquemoney",
				contentType: false,
				processData: false,
				cache: false,
				data: formData,
				type: "POST",
				success: function (response) {
					// $("#progressoModalSaque").css("width","70%").html("70%");

					ret = JSON.parse(response);

					// $("#progressoModalSaque").css("width","80%").html("80%");

					switch (parseInt(ret)) {
						case 100200:
							$("#msg-success span").text(
								"Saque solicitado com sucesso!",
							);
							// $("#confirmSaqueInfo").html("Saque solicitado com sucesso! ");
							// $("#progressoModalSaque").css("width","100%").html("100%");
							// $("#progressoModalSaque").removeClass( "progress-indicating" );//.addClass( "active" );
							// $("#Step3Saque").removeClass( "active" ).addClass( "done" );
							break;
						case 100500:
							$("#msg-success span").text(
								"Falha! Favor verificar as informações e tentar novamente.",
							);
							$("#msg-success")
								.removeClass("is-success")
								.addClass("is-warning");
							// $("#confirmSaqueInfo").html("Falha! Favor verificar as informações e tentar novamente.");
							// $("#progressoModalSaque").removeClass( "progress-bar-warning" ).addClass( "progress-bar-danger" );
							break;
						case 100504:
							$("#msg-success span").text(
								"Falha! Falha no envio da nota fiscal.",
							);
							$("#msg-success")
								.removeClass("is-success")
								.addClass("is-warning");
							// $("#confirmSaqueInfo").html("");
							// $("#progressoModalSaque").removeClass( "progress-bar-warning" ).addClass( "progress-bar-danger" );
							break;
					} //fim switch
				},
			});
		}
	};
	/**Função Utilitária */
	$scope.number_format = function (
		number,
		decimals = 2,
		dec_point = ",",
		thousands_sep = ".",
	) {
		// Strip all characters but numerical ones.
		number = (number + "").replace(/[^0-9+\-Ee.]/g, "");
		var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
			dec = typeof dec_point === "undefined" ? "." : dec_point,
			s = "",
			toFixedFix = function (n, prec) {
				var k = Math.pow(10, prec);
				return "" + Math.round(n * k) / k;
			};
		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || "").length < prec) {
			s[1] = s[1] || "";
			s[1] += new Array(prec - s[1].length + 1).join("0");
		}
		return s.join(dec);
	};

	$scope.returnStep = function (status) {
		if (status == 0) {
			$("#saqueZeroPasso").show();
			$("#saquePrimeiroPasso").hide();
			$("#Step0Saque").removeClass("done").addClass("active");
			$("#Step1Saque").removeClass("active");
			$scope.resetExtrato();
		}
	};

	$scope.resetExtrato = function (status) {
		$scope.inss = 0;
		$scope.inssPtBr = $scope.number_format(0);
		$scope.valorSacar = 0;
		$scope.valorSacarPtBr = $scope.number_format(0);
		$scope.valorReceber = 0;
		$scope.valorReceberPtBr = $scope.number_format(0);
		$scope.valorIr = 0;
		$scope.valorIrPtBr = $scope.number_format(0);
	};
});

function versaovmasterangularraw() {
	console.log('/public/layouts/ev/js/master.angular.js - 22');
}
