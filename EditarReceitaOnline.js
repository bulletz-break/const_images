/**
 * @author      Luiz Eurico da Silva Neto
 * @date        01/02/2024
 * @version     2.0.0
 * @copyright   A22 Serviços Industriais
 * 
 * Classe para manipulação do Widget de Criação / Edição de Receitas da Lavadora
 * Widget Online com controle sobre as receitas existentes na máquina
 */

// NÍVEL ÁGUA
// BAIXO    = 1
// MÉDIO    = 2
// ALTO     = 3

class EditarReceitaOnline {
    /**
     * Construtor da Classe
     */
    constructor(container = null, attributeService = null, entity_id = null) {
        /**
         * @brief Container para obter os elementos limitados ao Widget
         */
        this.container  = container

        /**
         * @brief Objeto da classe contendo o serviço de atributos do ThingsBoard
         */
        this.attributeService   = attributeService;

        /**
         * @brief ID do dispositivo no ThingsBoard
         */
        this.entity_id  = entity_id;

        /**
         * @brief Nomes das receitas existentes na máquina
         */
        this.receita_names  = [];

        /**
         * @brief Array para armazenar a Receita completa
         */
        this.receita    = {};
        this.receita['delicada']    = false;

        /**
         * @brief Largura da tela (px)
         */
        this.width      = 0;

        /**
         * @brief Altura da tela (px)
         */
        this.height     = 0;

        /**
         * @brief Objeto para armazenar os dados do passo atual da Receita
         */
        this.step       = {
            "StepName"      : "",
            "Carregar"      : false,
            "Lavar"         : false,
            "Centrifugar"   : false,
            "Dreno"         : false,
            "Descarregar"   : false,
            "Reuso"         : false
        };

        /**
         * @brief Passo atual da Receita (começando em 1)
         */
        this.step_index = 1;

        /**
         * @brief Armazena a tela atual do Widget
         */
        this.page       = "initial";

        /**
         * @brief Objeto contendo todas as imagens utilizadas pelo Widget
         */
        this.images     = new WidgetImages();
        // -------------------------------------------------------------------------------------------------
        this.events     = {
            "initial"   : {
                /**
                 * @brief Gerencia os eventos trigados da tela
                 * 
                 * @param {Object} element elemento clicado
                 */
                "manager"   : (element) => {
                    /**
                     * @brief Altera a imagem e o status do estágio no JSON do passo da Receita
                     * 
                     * @param key (string) chave JSON para alterar o valor
                     * @param stage (string) estágio para alterar
                     * @param status (bool) status para setar
                     * @param t (?) variável `this` da classe
                     */
                    function stage_set_status(key, stage, status, t) {
                        t.step[key]   = status;
                        t.elements['data']['initial'][stage].attr("src", t.images[`${stage}_${(status ? "on" : "off")}`]);
                    }
                    // Obtendo chave do elemento clicado
                    let key = element.attr("key");
                    
                    // Obtendo estágio clicado
                    let stage = element.attr("stage");

                    // Objeto contendo os elementos que devem ser bloqueados para garantir que só um seja selecionado
                    let object = {}
                    Object.keys(this.elements['data']['initial']).forEach((index) => {
                        if(index != "step_name" && index != "delicate") {
                            object[index] = this.elements['data']['initial'][index];
                        }
                    });

                    // Por algum motivo, ele bloqueia o nome do passo
                    // Resolvido com a verificação
                    if(key != "StepName" && key != "delicate") {
                        if(!this.step[key]) { // Desativado; Ativar
                            stage_set_status(key, stage, true, this);    // Ativando
                            this.stage_set_block(object, stage, true);     // Bloqueando outros Estágios
                        } else { // Ativado; Desativar
                            stage_set_status(key, stage, false, this);   // Desativando
                            this.stage_set_block(object, stage, false);    // Desbloqueando outros Estágios
                        }
                    }

                    if(stage == "lavar" || stage == "centrifugar") {
                        // Se estiver ativando o Estágio
                        if(this.step[key]) { this.show_screen(stage); }
                    }
                }
            },
            "lavar"     : {
                "manager"   : (element) => {
                    // Obtendo estágio clicado
                    let stage   = element.attr("stage");
                    // Obtendo chave do JSON da Receita do estágio
                    let key     = element.attr("key");
                    // Objeto com os elementos que devem ser forçados à escolha única
                    let object  = {};

                    switch(key) {
                        case "NivelAgua" : {
                            this.step[key]  = Number(element.attr("val"));
                            object = {
                                "nivel_baixo"   : this.elements['data']['lavar']['nivel_baixo'],
                                "nivel_medio"   : this.elements['data']['lavar']['nivel_medio'],
                                "nivel_alto"    : this.elements['data']['lavar']['nivel_alto']
                            };
                            break;
                        }

                        case "AguaFria" :
                        case "AguaQuente" : {
                            // Opção desativada; Ativar
                            if(!this.step[key]) {
                                this.step[key] = true;
                            } else { this.step[key] = false; } // Opção ativada; Desativar

                            object = {
                                "agua_1"        : this.elements['data']['lavar']['agua_1'],
                                "agua_2"        : this.elements['data']['lavar']['agua_2']
                            }
                            break;
                        }

                        case "AquecerAgua" :
                        case "produtos" : {
                            this.show_screen(stage);
                            break;
                        }

                        case "Tempo": {
                            this.step["Tempo"] = Number(this.elements['data']['lavar']['time'].val());
                            break;
                        }

                        case "back": {
                            this.show_screen("initial");
                            break;
                        }
                    }

                    this.set_once_choose(object, stage);
                }
            },
            "produtos"  : {
                "manager"   : (element) => {
                    // Obtendo chave do elemento clicado
                    let key = element.attr("key");

                    // Garantindo que a chave exista
                    this.step['relacao_ml_s'] = (this.step['relacao_ml_s'] == undefined ? true : this.step['relacao_ml_s']);

                    if(key == "back") {
                        for(let i = 0; i < 8; i++) {
                            this.step[`Soap${i+1}`] = Number(this.elements['data']['produtos'][`produto_${i+1}`].val());
                        }

                        this.show_screen("lavar");
                    } else if(key == "measure") {
                        // Está na relação ml/s; trocar para segundos
                        if(this.elements['data']['produtos']['measure'].val() == "Mililitros") {
                            this.step['relacao_ml_s']   = false;
                            this.elements['data']['produtos']['measure'].val("Segundos");
                        } else { // Está na medida de segundos; trocar para relação ml/s
                            this.elements['data']['produtos']['measure'].val("Mililitros");
                            this.step['relacao_ml_s']   = true;
                        }
                    }
                }
            },
            "centrifugar" : {
                "manager" : (element) => {
                    // Obtendo a chave do elemento clicado
                    let key = element.attr("key");
                    // Obtendo estágio clicado
                    let stage = element.attr("stage");

                    switch(key) {
                        case "Dreno": {
                            this.step["Dreno"]  = true;
                            this.step["Reuso"]  = false;
                            break;
                        }

                        case "Reuso": {
                            this.step["Reuso"]  = true;
                            this.step["Dreno"]  = false;
                            break;
                        }

                        case "back" : {
                            this.show_screen("initial");
                            break;
                        }

                        case "Tempo" : {
                            this.step["Tempo"]  = Number(this.elements['data']['centrifugar']['time'].val());
                            break;
                        }
                    }

                    if(key == "Dreno" || key == "Reuso") {
                        this.set_once_choose({
                            "dreno_1"   : this.elements['data']['centrifugar']['dreno_1'],
                            "dreno_2"   : this.elements['data']['centrifugar']['dreno_2']
                        }, stage);
                    }
                }
            },
            "aquecimento" : {
                "manager"   : (element) => {
                    // Obtndo a chave do elemento clicado
                    let key = element.attr("key");

                    switch(key) {
                        case "AquecerAgua": {
                            if(this.step["AquecerAgua"]) { // Ativado; Desativar
                                this.step["AquecerAgua"]    = false;
                                this.elements['data']['aquecimento']['aquecimento'].val("Desligado");
                            } else {
                                this.step["AquecerAgua"]    = true;
                                this.elements['data']['aquecimento']['aquecimento'].val("Ligado");
                            }
                            break;
                        }

                        case "aguardarPatamar": {
                            if(this.step["aguardarPatamar"]) {
                                this.step["aguardarPatamar"]    = false;
                                this.elements['data']['aquecimento']['patamar'].val("Não");
                            } else {
                                this.step["aguardarPatamar"]    = true;
                                this.elements['data']['aquecimento']['patamar'].val("Sim");
                            }
                            break;
                        }

                        case "manterTemperatura" : {
                            if(this.step["manterTemperatura"]) {
                                this.step["manterTemperatura"]  = false;
                                this.elements['data']['aquecimento']['manter'].val("Não");
                            } else {
                                this.step["manterTemperatura"]  = true;
                                this.elements['data']['aquecimento']['manter'].val("Sim");
                            }
                            break;
                        }

                        case "TempAgua": {
                            this.step["TempAgua"]   = Number(this.elements['data']['aquecimento']['setpoint'].val());
                            break;
                        }

                        case "back": {
                            this.show_screen("lavar");
                            break;
                        }
                    }
                }
            },
            "select_receita" : {
                "manager" : (element) => {
                    let key = element.attr("key");

                    switch(key) {
                        case "continue": {
                            let can_continue    = false;
                            this.receita['programName'] = this.elements['data']['select_receita']['select'].val();

                            // Editar Receita já existente
                            if(this.receita['programName'] != "new") {
                                this.attributeService.getEntityAttributes(this.entity_id, "SHARED_SCOPE", [`r_${this.receita['programName']}`]).subscribe((attr) => {
                                    console.log(attr);
                                    this.receita    = (attr[0] == undefined ? {} : attr[0]["value"]);

                                    this.step_index = 1;
                                    this.step_init();
                                    this.insert_step_data(this.receita[`${this.step_index-1}`]);
                                    can_continue = true;
                                });
                            } else { can_continue = true; }

                            let interval = setInterval(() => {
                                if(can_continue) {
                                    this.elements['screen']['select_receita'].css("display", "none");

                                    $("#screen_top", this.container).css("display", "flex");
                                    this.elements['screen']['initial'].css("display", "grid");
                                    $("#screen_bottom", this.container).css("display", "flex");

                                    clearInterval(interval);
                                }
                            }, 100);
                            break;
                        }
                    }
                }
            }
        };
    }

    /**
     * @brief Faz todos os preparativos do Widget
     */
    init() {
        this.get_elements();
        this.set_images();
        this.set_produtos();

        // Adicionando inputs dos produtos 1 ~ 8 no objeto dos elementos da tela
        for(let i = 0; i < 8; i++) {
            this.elements['data']['produtos'][`produto_${i+1}`] = $(`#screen_produto_${i+1}`, this.container);
        }
    }

    /**
     * @brief Inicia as funções do Widget
     */
    begin() {
        this.set_events();
        this.set_receita_names();
        this.manage_disponibility_buttons();
    }

    /**
     * @brief Obtém todos os elementos utilizados pelo Widget
     */
    get_elements() {
        this.elements = {   // Objeto contendo os elementos que serão manipulador pelo Widget
            "images"    : { // Objeto contendo os elementos que devem ser inseridas as imagens
                // Imagens indepentendes da tela atual
                "absolute"  :  {
                    "logo"  : $("#screen_iks_logo", this.container)
                },
                // Imagens da Tela Inicial
                "initial"   : {
                    "carregar"      : $("#screen_stage_carregar", this.container),
                    "lavar"         : $("#screen_stage_lavar", this.container),
                    "centrifugar"   : $("#screen_stage_centrifugar", this.container),
                    "dreno_1"       : $("#screen_stage_dreno_1", this.container),
                    "descarregar"   : $("#screen_stage_descarregar", this.container),
                    "dreno_2"       : $("#screen_stage_dreno_2", this.container)
                },
                // Imagens da Tela de Lavar
                "lavar"     : {
                    "agua_1"        : $("#screen_stage_lavar_agua_1", this.container),
                    "nivel_baixo"   : $("#screen_stage_lavar_nivel_baixo", this.container),
                    "nivel_medio"   : $("#screen_stage_lavar_nivel_medio", this.container),
                    "nivel_alto"    : $("#screen_stage_lavar_nivel_alto", this.container),
                    "agua_2"        : $("#screen_stage_lavar_agua_2", this.container),
                    "temperatura"   : $("#screen_stage_lavar_aquecimento", this.container),
                    "produtos"      : $("#screen_stage_lavar_produtos", this.container),
                    "time"          : $("#screen_stage_lavar_time", this.container),
                    "back"          : $("#screen_stage_lavar_voltar", this.container)
                },
                // Imagens da Tela de Centrifugação
                "centrifugar"   : {
                    "dreno_1"       : $("#screen_stage_centrifugar_dreno_1", this.container),
                    "dreno_2"       : $("#screen_stage_centrifugar_dreno_2", this.container),
                    "back"          : $("#screen_stage_centrifugar_voltar", this.container)
                },
                // Imagens da Tela de Produtos Químicos
                "produtos"      : {
                    "back"          : $("#screen_stage_produtos_voltar", this.container)
                },
                // Imagens da Tela de Aquecimento
                "aquecimento"   : {
                    "back"          : $("#screen_stage_aquecimento_voltar", this.container)
                }
            },
            "data"  : { // Objeto contendo os elementos que serão coletados os dados para a construção do JSON da Receita
                "initial" : {
                    "carregar"      : $("#screen_stage_carregar", this.container),
                    "lavar"         : $("#screen_stage_lavar", this.container),
                    "centrifugar"   : $("#screen_stage_centrifugar", this.container),
                    "dreno_1"       : $("#screen_stage_dreno_1", this.container),
                    "descarregar"   : $("#screen_stage_descarregar", this.container),
                    "dreno_2"       : $("#screen_stage_dreno_2", this.container),
                    "step_name"     : $("#step_name_input", this.container),
                    "delicate"      : $("#delicate_wash_input", this.container)
                },
                "lavar" : {
                    "agua_1"            : $("#screen_stage_lavar_agua_1", this.container),
                    "nivel_baixo"       : $("#screen_stage_lavar_nivel_baixo", this.container),
                    "nivel_medio"       : $("#screen_stage_lavar_nivel_medio", this.container),
                    "nivel_alto"        : $("#screen_stage_lavar_nivel_alto", this.container),
                    "agua_2"            : $("#screen_stage_lavar_agua_2", this.container),
                    "aquecimento"       : $("#screen_stage_lavar_aquecimento", this.container),
                    "produtos"          : $("#screen_stage_lavar_produtos", this.container),
                    "back"              : $("#screen_stage_lavar_voltar", this.container),
                    "time"              : $("#step_time_input", this.container)
                },
                "produtos"  : {
                    "measure"           : $("#screen_stage_produtos_measure_input", this.container),
                    "back"              : $("#screen_stage_produtos_voltar", this.container)
                },
                "centrifugar" : {
                    "dreno_1"           : $("#screen_stage_centrifugar_dreno_1", this.container),
                    "dreno_2"           : $("#screen_stage_centrifugar_dreno_2", this.container),
                    "back"              : $("#screen_stage_centrifugar_voltar", this.container),
                    "time"              : $("#screen_stage_centrifugar_tempo", this.container)
                },
                "aquecimento"   : {
                    "aquecimento"       : $("#screen_stage_aquecimento_aquecimento", this.container),
                    "setpoint"          : $("#screen_stage_aquecimento_setpoint", this.container),
                    "patamar"           : $("#screen_stage_aquecimento_patamar", this.container),
                    "manter"            : $("#screen_stage_aquecimento_manter", this.container),
                    "back"              : $("#screen_stage_aquecimento_voltar", this.container)
                },
                "select_receita"    : {
                    "select"            : $("#select_receita_select", this.container),
                    "continue"          : $("#select_receita_continue", this.container)
                }
            },
            "buttons"   : {
                "container"         : $("#screen_buttons_container", this.container),
                "voltar"            : $("#screen_button_voltar", this.container),
                "proximo"           : $("#screen_button_proximo", this.container),
                "inserir"           : $("#screen_button_inserir", this.container),
                "excluir"           : $("#screen_button_excluir", this.container),
                "salvar"            : $("#screen_button_salvar", this.container)
            },
            "screen" : {
                "initial"           : $("#screen_stage_container_initial", this.container),
                "lavar"             : $("#screen_stage_container_lavar", this.container),
                "produtos"          : $("#screen_stage_container_produtos", this.container),
                "aquecimento"       : $("#screen_stage_container_aquecimento", this.container),
                "centrifugar"       : $("#screen_stage_container_centrifugar", this.container),
                "select_receita"    : $("#screen_stage_container_select_receita", this.container)
            },
            "save"  : {
                "container"         : $("#screen_save_container", this.container),
                "input"             : $("#screen_save_input", this.container),
                "button"            : $("#screen_save_button", this.container)
            },
            "other" : {
                "clean_receita"         : $("#screen_clean_receita", this.container),
                "import_receita_fake"   : $("#screen_import_receita_fake", this.container),
                "import_receita_real"   : $("#screen_import_receita_real", this.container)
            },
        };
    }

    /**
     * @brief Função para ajustar os elementos do Widget para responsividade
     * 
     * @param {Number} width largura da tela / Widget
     * @param {Number} height altura da tela / Widget
     */
    resize(width, height) {
        this.width  = width;
        this.height = height;

        if(this.width <= 700) {
            $(".screen_division_extremes_item").css({
                "flex-direction" : "column"
            });
    
            $("#screen").css({
                "max-height"    : "",
                "height"        : "100%"
            });
    
            $(".screen_division_extremes_item_container").css({
                "padding" : "10px 0px"
            });
    
            $(".screen_stage_container_grid").css({
                "grid-template-columns" : "repeat(1, 1fr)"
            });
    
            $(".screen_division").css({
                "padding" : "10px 0px"
            });
    
            $("#screen_buttons_container").css({
                "flex-direction" : "column"
            });
    
            $(".screen_button_container").css({
                "padding" : "10px 0px"
            });
    
            $(".screen_stage_container_up").css("grid-row", "initial");
            $(".screen_stage_container_bottom").css("grid-row", "initial");
    
            $(".screen_stage_image_back").css("max-width", "50px");
            $("#screen_stage_produtos_measure_box").css("flex-direction", "column");
            $(".screen_stage_item_line_container").css("flex-direction", "column");
        } else {
            $(".screen_division_extremes_item").css({
                "flex-direction" : "row"
            });
    
            $("#screen").css({
                "max-height"    : "768px",
                "height"        : ""
            });
    
            $(".screen_division_extremes_item_container").css({
                "padding" : "0px 0px"
            });
    
            $(".screen_stage_container_grid").css({
                "grid-template-columns" : "repeat(3, 1fr)"
            });
    
            $(".screen_division").css({
                "padding" : "00px 0px"
            });
    
            $("#screen_buttons_container").css({
                "flex-direction" : "row"
            });
    
            $(".screen_stage_container_up").css("grid-row", "1");
            $(".screen_stage_container_bottom").css("grid-row", "2");
    
            $(".screen_stage_image_back").css("max-width", "50px");
            $("#screen_stage_produtos_measure_box").css("flex-direction", "row");
            $(".screen_stage_item_line_container").css("flex-direction", "row");
        }
    }

    /**
     * @brief Insere as imagens nos elementos necessários
     */
    set_images() {
        // Setando as imagens Independentes
        this.set_images_screen(this.elements["images"]["absolute"]);

        // Setando as imagens da Tela Inicial
        this.set_images_screen(this.elements["images"]["initial"]);

        // Setando as imagens da Tela de Lavar
        this.set_images_screen(this.elements["images"]["lavar"]);

        // Setando as imagens da Tela de Centrifugar
        this.set_images_screen(this.elements["images"]["centrifugar"]);

        // Setando as imagens da Tela de Produtos Químicos
        this.set_images_screen(this.elements["images"]["produtos"]);

        // Setando as imagens da Tela de Aquecimento
        this.set_images_screen(this.elements["images"]["aquecimento"]);
    }

    /**
     * @brief Insere as imagens de acordo com a tela fornecida
     * 
     * @param {Object} screen_elements objeto contendo os elementos para inserir as imagens
     */
    set_images_screen(screen_elements) {
        // Percorrendo os elementos do Objeto para setar as imagens
        Object.keys(screen_elements).forEach((screen_index) => {
            if(this.images[`${screen_index}_off`] != undefined) {   // Index com sufixo
                screen_elements[screen_index].attr("src", this.images[`${screen_index}_off`]);
            } else if(this.images[`${screen_index}`] != undefined) { // Index sem sufixo
                screen_elements[screen_index].attr("src", this.images[`${screen_index}`]);
            }
        });
    }

    /**
     * @brief Seta a imagem como ativada
     * 
     * @param {String} element_data_index índice do objeto `this.elements['data']`
     * @param {String} element_set índice do elemento para alterar a imagem (dentro de `element_data_index`)
     * @param {String} image_index índice da imagem em WidgetImages()
     * @param {Boolean} active se deve ativar a imagem
     */
    set_image_active(element_data_index, element_set, image_index, active) {
        if(active) { // Ativar imagem
            if(this.images[`${image_index}_on`] != undefined) { // Index com sufixo
                this.elements['data'][element_data_index][element_set].attr("src", this.images[`${image_index}_on`]);
            }
        } else { // Desativar imagem
            if(this.images[`${image_index}_off`] != undefined) { // Index com sufixo
                this.elements['data'][element_data_index][element_set].attr("src", this.images[`${image_index}_off`]);
            } else if(this.images[`${image_index}`] != undefined) {
                this.elements['data'][element_data_index][element_set].attr("src", this.images[`${image_index}`]);
            }
        }
    }

    /**
     * @brief Registra os eventos para manipulação dos dados do Widget
     */
    set_events() {
        // Registrando eventos de botões / imagens clicáveis
        Object.keys(this.elements["data"]).forEach((e_data_index) => {
            Object.keys(this.elements["data"][e_data_index]).forEach((o_data_index) => {
                this.elements["data"][e_data_index][o_data_index].on("click", (t) => {
                    // Gerenciando evento
                    this.events[e_data_index]["manager"]($(t.currentTarget));
                    // Gerenciando botão de voltar da tela
                    this.manage_back();
                    // Gerenciando botões
                    if(this.page == "initial") { this.manage_disponibility_buttons(); }
                })
            });
        });

        // Registrando eventos de campos digitáveis
        // Registrando evento do Tempo da Lavagem
        this.elements['data']['lavar']['time'].on("change", (t) => {
            this.events['lavar']["manager"]($(t.currentTarget));
            this.manage_back();
        });

        this.elements['data']['aquecimento']['setpoint'].on("change", (t) => {
            this.events['aquecimento']['manager']($(t.currentTarget));
            this.manage_back();
        })

        // Registrando evento do Tempo da Centrifugação
        this.elements['data']['centrifugar']['time'].on("change", (t) => {
            this.events['centrifugar']["manager"]($(t.currentTarget));
            this.manage_back();
        });
        
        // Registrando evento do Nome do Passo
        this.elements['data']['initial']['step_name'].on("change", (t) => {
            this.step['StepName']   = String($(t.currentTarget).val()).trim();
            this.manage_disponibility_buttons();
        });

        // Registrando eventos dos botões dos passos do Widget
        Object.keys(this.elements['buttons']).forEach((button) => {
            this.elements['buttons'][button].on("click", (t) => {
                this.manage_buttons($(t.currentTarget).attr("key"));
            })
        });

        // Salvar Receita
        // - No botão Salvar
        this.elements['save']['button'].on("click", () => {
            this.receita_save();
        });

        // - Pressionando Enter
        this.elements['save']['input'].on("keypress", (e) => {
            if(e.which == 13) { // 13 = Enter
                this.receita_save();
            }
        });

        // Limpar Receita
        this.elements['other']['clean_receita'].on("click", () => {
            let step_index = $("#screen_step", this.container);

            this.receita = {'delicada' : (this.elements['data']['initial']['delicate'].is(":checked"))};
            this.step_init();
            this.step_index = 1;

            step_index.text(`Passo: ${this.step_index}`);
            this.manage_buttons();
        });

        // Importar Receita
        this.elements['other']['import_receita_fake'].on("click", () => {
            this.elements['other']['import_receita_real'].click();
        });

        this.elements['other']['import_receita_real'].on("change", (e) => {
            this.receita_import(e);
        })

        $("body").on("dragover", (e) => {
            this.receita_import(e);
        });

        $("body").on("drop", (e) => {
            this.receita_import(e);
        })

        // Selecionar Receita
        this.elements['data']['select_receita']['select'].on("change", (e) => {
            this.events['select_receita']['manager']($(e.currentTarget));
        })
    }

    /**
     * @brief Mostra uma tela e esconde as outras
     * 
     * @param {String} screen tela para mostrar
     */
    show_screen(screen) {
        let display_type;

        let element = {
            "step_name" : $("#step_name_box", this.container),
            "time"      : $("#step_time_box", this.container),
            "delicate"  : $("#delicate_wash_box", this.container),
            "import_clean"  : $("#import_clean_receita_container", this.container)
        };

        // Esconder / mostrar elementos somente da Tela Inicial
        if(screen == "initial") {
            // Mostrando elementos do Nome do Passo
            element['step_name'].css("display", "flex");
            // Mostrando elementos dos Botões dos Passos
            this.elements['buttons']['container'].css("display", "flex");
            // Mostrando elementos da Lavagem Delicada
            element['delicate'].css("display", "flex");
            // Mostrando elementos de Importar / Limpar Receita
            element['import_clean'].css("display", "flex");

        } else {
            // Escondendo elementos do Nome do Passo
            element['step_name'].css("display", "none");
            // Escondendo elementos dos Botões dos Passos
            this.elements['buttons']['container'].css("display", "none");
            // Escondendo elementos da Lavagem Delicada
            element['delicate'].css("display", "none");
            // Mostrando elementos de Importar / Limpar Receita
            element['import_clean'].css("display", "none");
        }

        // Esconder / mostrar elementos somente da Tela de Lavar
        if(screen == "lavar") {
            // Mostrando elementos do Tempo do Passo
            element['time'].css("display", "flex");
        } else {
            // Escondendo elementos do Tempo do Passo
            element['time'].css("display", "none");
        }

        switch(screen) {
            // Telas com display do tipo `grid`
            case "initial":
            case "lavar": {
                display_type = "grid";
                break;
            }

            // Telas com display do tipo `flex`
            case "aquecimento" :
            case "centrifugar" : {
                display_type = "flex";
                break;
            }

            // Telas com display do tipo `block`
            default : {
                display_type = "block";
                break;
            }
        }

        Object.keys(this.elements["screen"]).forEach((screen_index) => {
            let visible = (screen == screen_index);
            this.elements["screen"][screen_index].css("display", (visible ? display_type : "none"));
        });

        this.page   = screen;
    }

    /**
     * @brief Bloquea / desbloquea os demais elementos na tela
     * 
     * @param {Object} object objeto para percorrer bloqueando / desbloqueando
     * @param {String} stage estágio ativar / desativar
     * @param {Boolean} status status para setar
     */
    stage_set_block(object, stage, status) {
        Object.keys(object).forEach((index) => {
            if(stage != index) {
                this.elements['data']['initial'][index].css({
                    "pointer-events"    : `${(status ? "none"   : "all")}`,
                    "opacity"           : `${(status ? "0.7"    : "1")}`
                });
            }
        });
    }

    /**
     * @brief Gerencia as opções em que apenas uma pode ser selecionada
     * 
     * @param {Object} object objeto para percorrer e bloquear / desbloquear
     * @param {String} stage estágio para ativar / desativar
     * 
     * @return {Boolean} false se o objeto for vazio, true se tudo der certo
     */
    set_once_choose(object, stage) {
        if(object == {}) { return false; }

        Object.keys(object).forEach((index) => {
            let active = (stage == index);

            object[index].attr("src", this.images[`${index}_${(active ? "on" : "off")}`]);
        });

        return true;
    }

    /**
     * @brief Volta o objeto do passo da receita ao estado inicial
     */
    step_init() {
        // Zerando variável que armazena os dados do passo
        this.step = {
            "StepName"      : "",
            "Carregar"      : false,
            "Lavar"         : false,
            "Centrifugar"   : false,
            "Dreno"         : false,
            "Descarregar"   : false,
            "Reuso"         : false
        };

        // Voltando elementos ao estado padrão
        // Voltando imagens ao estado padrão
        this.set_images();

        // - Tela Inicial
        this.elements['data']['initial']['step_name'].val("");

        // Desbloqueando opções da Tela Inicial
        Object.keys(this.elements['data']['initial']).forEach((index) => {
            this.elements['data']['initial'][index].css({
                "pointer-events" : "all",
                "opacity"   : "1"
            });
        });

        // - Tela de Lavar
        this.elements['data']['lavar']['time'].val(0);

        // - Tela de Produtos
        this.elements['data']['produtos']['measure'].val("Mililitros");
        for(let i = 0; i < 8; i++) {
            this.step[`Soap${i+1}`] = 0;
            this.elements['data']['produtos'][`produto_${i+1}`].val(0);
        }

        // - Tela de Centrifugar
        this.elements['data']['centrifugar']['time'].val(0);

        // - Tela de Aquecimento
        this.elements['data']['aquecimento']['aquecimento'].val("Desligado");
        this.elements['data']['aquecimento']['setpoint'].val(0);
        this.elements['data']['aquecimento']['patamar'].val("Não");
        this.elements['data']['aquecimento']['manter'].val("Não");
    }

    /**
     * @brief Gerencia os botões dos passos do Widget (`Próximo`, `Voltar`, etc.)
     * bloqueando / desbloqueando de acordo com a validação
     * 
     * @return {Boolean} se os botões estão ativos
     */
    manage_disponibility_buttons() {
        /**
         * @brief Bloqueia os botões dos passos do Widget
         * 
         * @param {?} t variável `this` da classe
         */
        function block_buttons(t) {
            Object.keys(t.elements['buttons']).forEach((button) => {
                if(button != "voltar" && button != "container") {
                    t.elements['buttons'][button].css({
                        "pointer-events"    : "none",
                        "opacity"           : "0.7"
                    });
                }
            });
        }

        /**
         * @brief Desbloqueia os botões dos passos do Widget
         * 
         * @param {?} t variável `this` da classe
         */
        function unblock_buttons(t) {
            Object.keys(t.elements['buttons']).forEach((button) => {
                if(button != "voltar" && button != "container") {
                    t.elements['buttons'][button].css({
                        "pointer-events"    : "all",
                        "opacity"           : "1"
                    });
                }
            });
        }

        // Primeiro passo; Bloquear botão de Voltar
        if(this.step_index <= 1) {
            this.elements['buttons']['voltar'].css({
                "pointer-events"    : "none",
                "opacity"           : "0.7"
            });
        } else { // Desbloquear botão de Voltar
            this.elements['buttons']['voltar'].css({
                "pointer-events"    : "all",
                "opacity"           : "1"
            });
        }

        let buttons_active  = false;

        // Verificando se alguma opção foi marcada
        buttons_active  = this.step['Carregar'] || this.step['Lavar'] || this.step['Centrifugar'];
        buttons_active  = buttons_active || this.step['Dreno'] || this.step['Descarregar']
        buttons_active  = buttons_active || this.step['Reuso'];
        
        // Validando Nome do Passo
        // Se o nome do passo tem um tamanho válido
        buttons_active  = buttons_active && (this.step['StepName'].length >= 3)
        // Se o nome do passo não está vazio
        buttons_active  = buttons_active && (this.step['StepName'] != "");

        if(buttons_active) {
            unblock_buttons(this);
        } else {
            block_buttons(this);
        }

        return buttons_active
    }

    /**
     * @brief Retorna o passo filtrado
     * Ex: se Lavar não estiver habilitado, remove todos os dados que foram configurados em Lavar
     * 
     * @param {Object} step passo para filtrar
     * 
     * @return {Object} JSON com o passo filtrado
     */
    filter_step_data(step) {
        // Removendo dados de Lavar
        if(!step['Lavar']) {
            delete step['AguaFria'];
            delete step['AguaQuente'];
            delete step['NivelAgua'];
            delete step['AquecerAgua'];
            delete step['TempAgua'];
            delete step['aguardarPatamar'];
            delete step['manterTemperatura'];
            delete step['relacao_ml_s'];
            for(let i = 0; i < 8; i++) { delete step[`Soap${i+1}`]; }
        }

        // Nenhuma opção que utilize `Tempo` está ativa
        if(!step['Lavar'] && !step['Centrifugar']) {
            delete step['Tempo'];
        }
        return step;
    }

    /**
     * @brief Gerencia os botões dos passos do Widget
     * 
     * @param {String} button_key chave do botão pressionado
     */
    manage_buttons(button_key) {
        let step_index = $("#screen_step", this.container);

        switch(button_key) {
            // Voltar passo
            case "voltar": {
                if(this.manage_disponibility_buttons()) {
                    this.receita[`${this.step_index-1}`] = this.step;
                }

                this.step_init();
                this.insert_step_data(this.receita[`${this.step_index-2}`])

                this.step_index--;
                step_index.text(`Passo: ${this.step_index}`);
                break;
            }

            // Próximo passo
            case "proximo": {
                // Pegando os dados do passo atual filtrado
                this.get_step_data();
                this.receita[`${this.step_index-1}`] = this.filter_step_data(this.step);

                // Reiniciando passo
                this.step_init();

                // Atualizando passo atual
                this.step_index++;
                step_index.text(`Passo: ${this.step_index}`);

                // Próximo passo já existente
                if(this.receita[`${this.step_index-1}`]) {
                    this.insert_step_data(this.receita[`${this.step_index-1}`]);
                }

                break;
            }

            // Inserir passo
            case "inserir": {
                // Variável para armazenar a quantidade de passos à frente
                let steps_forward_count = 0;

                // Obtendo dados do passo atual
                this.get_step_data();
                this.receita[`${this.step_index-1}`] = this.filter_step_data(this.step);

                // Contando passos à frente
                while(true) {
                    if(this.receita[`${(this.step_index - 1) + steps_forward_count}`])
                        { steps_forward_count++; }
                    else { break; }
                }

                // Movendo passos à frente
                while(steps_forward_count > 0) {
                    this.receita[`${(this.step_index - 1) + steps_forward_count}`]  = this.receita[`${(this.step_index - 1) + (steps_forward_count - 1)}`];
                    steps_forward_count--;
                }

                this.step_init();
                
                break;
            }

            // Excluir passo
            case "excluir": {
                // Primeiro passo; apenas limpar os campos
                if(this.step_index <= 1) { return this.step_init(); }

                // Receita em forma de Array para facilitar a remoção do passo
                let array_receita   = [];

                // Transferindo passos para a Receita em formato de Array
                Object.keys(this.receita).forEach((index) => {
                    if(typeof this.receita[index] == 'object') {
                        array_receita.push(this.receita[index]);    // Transferindo passo para o Array
                        delete this.receita[index];                 // Removendo passo do JSON
                    }
                });

                // Removendo chave do JSON da receita
                array_receita.splice(this.step_index - 1, 1);

                let counter = 0;
                array_receita.forEach((index) => {
                    if(typeof index == 'object') {
                        this.receita[`${counter}`]  = index;
                        counter++;
                    }
                });

                // Limpando campos
                this.step_init();
                // Esperando para não limpar os campos do passo errado
                setTimeout(() => {
                    this.manage_buttons("voltar");
                }, 50);

                break;
            }

            // Salvar receita
            case "salvar": {
                this.get_step_data();
                this.receita[`${this.step_index-1}`] = this.filter_step_data(this.step);

                $("#screen").css("display", "none");
                this.elements['save']['container'].css("display", "flex");
                break;
            }
        }

        this.manage_disponibility_buttons();
    }

    /**
     * @brief Gerencia o botão de voltar da tela
     */
    manage_back() {
        if(this.page == "initial") { return; }

        function block_button(button_element) {
            button_element.css({
                "pointer-events" : "none",
                "opacity" : "0.7"
            });
        } 

        function unblock_button(button_element) {
            button_element.css({
                "pointer-events" : "all",
                "opacity" : "1"
            });
        }

        let active_button = false;

        switch(this.page) {
            case "lavar": {
                active_button = this.manage_back_lavar();
                break;
            }

            case "aquecimento": {
                active_button = this.manage_back_aquecimento();
                break;
            }

            case "produtos": {
                active_button = this.manage_back_produtos();
                break;
            }

            case "centrifugar": {
                active_button = this.manage_back_centrifugar();
                break;
            }
        }

        if(active_button) {
            unblock_button(this.elements['data'][this.page]['back']);
        } else {
            block_button(this.elements['data'][this.page]['back']);
        }
    }

    /**
     * @brief Gerencia o botão de voltar da Tela de Lavar
     * 
     * @return {Boolean} true se tudo estiver em ordem, false se algo estiver inválido
     */
    manage_back_lavar() {
        // Nenhuma Água foi selecionada
        if(!this.step['AguaFria'] && !this.step['AguaQuente']) { return false; }
        // Nenhum Nível de Água foi selecionado
        if(!this.step['NivelAgua']) { return false; }
        // Tempo inválido
        if(this.step['Tempo'] <= 0 || !this.step['Tempo']) { return false; }

        // Tudo em ordem
        return true;
    }

    /**
     * @brief Gerencia o botão de voltar da Tela de Aquecimento
     * 
     * @return {Boolean} true se tudo estiver em ordem, false se algo estiver inválido
     */
    manage_back_aquecimento() {
        // Foi selecionado para aquecer mas nenhuma temperatura válida foi informada
        if(this.step['AquecerAgua'] && Number(this.elements['data']['aquecimento']['setpoint'].val()) <= 0)
            { return false; }

        // Tudo em ordem
        return true;
    }

    /**
     * @brief Gerencia o botão de voltar da Tela de Produtos
     * 
     * @return {Boolean} true se tudo estiver em ordem, false se algo estiver inválido
     */
    manage_back_produtos() {
        // Nenhuma validação necessária
        return true;
    }

    /**
     * @brief Gerencia o botão de voltar da Tela de Centrifugar
     * 
     * @return {Boolean} true se tudo estiver em ordem, false se algo estiver inválido
     */
    manage_back_centrifugar() {
        // Tempo inválido
        if(this.step['Tempo'] <= 0 || !this.step['Tempo']) { return false; }
        // Nenhum Dreno foi selecionado
        if(!this.step['Dreno'] && !this.step['Reuso']) { return false; }

        // Tudo em ordem
        return true;
    }

    /**
     * @brief Pega os dados do passo que podem não terem sido coletados
     * OBS: não pega os dados da Tela Inicial
     */
    get_step_data() {
        // - Pegando dados da Tela de Produtos
        for(let i = 0; i < 8; i++) 
            { this.step[`Soap${i+1}`] = this.step[`Soap${i+1}`] = Number(this.elements['data']['produtos'][`produto_${i+1}`].val()); }
        this.step['relacao_ml_s']   = (this.elements['data']['produtos']['measure'].val() == "Mililitros");

        // - Pegando dados da Tela de Aquecimento
        this.step['AquecerAgua']        = (this.elements['data']['aquecimento']['aquecimento'].val() == 'Ligado');
        this.step['TempAgua']           = Number(this.elements['data']['aquecimento']['setpoint'].val());
        this.step['aguardarPatamar']    = (this.elements['data']['aquecimento']['patamar'].val() == "Sim");
        this.step['manterTemperatura']  = (this.elements['data']['aquecimento']['manter'].val() == "Sim");

        // - Pegando se é lavagem delicada
        this.receita['delicada']        = (this.elements['data']['initial']['delicate'].is(":checked"));
    }

    /**
     * @brief Insere os dados do passo no Widget e seta os inputs de acordo
     * 
     * @param {Object} step objeto contendo os dados do passo
     */
    insert_step_data(step) {
        let relation_index_name = {
            "delicate"      : "delicada",
            "carregar"      : "Carregar",
            "lavar"         : "Lavar",
            "centrifugar"   : "Centrifugar",
            "dreno_1"       : "Dreno",
            "descarregar"   : "Descarregar",
            "dreno_2"       : "Reuso",
            "agua_1"        : "AguaFria",
            "agua_2"        : "AguaQuente",
            "aquecimento"   : "AquecerAgua",
            "setpoint"      : "TempAgua",
            "patamar"       : "aguardarPatamar",
            "manter"        : "manterTemperatura",
            "measure"       : "relacao_ml_s",
            "time"          : "Tempo"
        };
        // Inserindo dados da Tela Inicial
        // - Imagens
        Object.keys(this.elements['images']['initial']).forEach((index) => {
            this.set_image_active('initial', index, index, step[relation_index_name[index]]);

            if(step[relation_index_name[index]])  {
                this.elements['data']['initial'][index].click();
            }
        });

        // - Campos Digitáveis
        // -- Nome do Passo
        this.elements['data']['initial']['step_name'].val(step['StepName']);
        // -- Lavagem Delicada
        this.elements['data']['initial']['delicate'].prop("checked", this.receita['delicada']);

        // Inserindo dados da Tela de Lavar
        // - Tempo do Passo
        this.elements['data']['lavar']['time'].val(step['Tempo']);
        // - Água Fria
        this.set_image_active('lavar', 'agua_1', 'agua_1', step['AguaFria']);
        // - Água Quente
        this.set_image_active('lavar', 'agua_2', 'agua_2', step['AguaQuente']);
        // - Nível de Água
        switch(step['NivelAgua']) {
            case 1: { // Nível Baixo
                this.set_image_active('lavar', 'nivel_baixo', 'nivel_baixo', true);
                break;
            }

            case 2: { // Nível Médio
                this.set_image_active('lavar', 'nivel_medio', 'nivel_medio', true);
                break;
            }

            case 3: { // Nível Alto
                this.set_image_active('lavar', 'nivel_alto', 'nivel_alto', true);
                break;
            }
        }

        // Inserindo dados da Tela de Aquecimento
        // - Aquecer Água
        this.elements['data']['aquecimento']['aquecimento'].val((step['AquecerAgua'] ? "Ligado" : "Desligado"));
        // - Temperatura da Água
        this.elements['data']['aquecimento']['setpoint'].val(step['TempAgua']);
        // - Aguardar Patamar
        this.elements['data']['aquecimento']['patamar'].val((step['aguardarPatamar'] ? "Sim" : "Não"));
        // - Manter Temperatura
        this.elements['data']['aquecimento']['manter'].val((step['manterTemperatura'] ? "Sim" : "Não"));

        // Inserindo dados da Tela de Produtos
        // - Produtos 1 ~ 8
        for(let i = 0; i < 8; i++) 
            { this.elements['data']['produtos'][`produto_${i+1}`].val(step[`Soap${i+1}`]); }
        // - Medida
        this.elements['data']['produtos']['measure'].val((step['relacao_ml_s'] ? "Mililitros" : "Segundos"));

        // Inserindo dados da Tela de Centrifugação
        // - Tempo do Passo
        this.elements['data']['centrifugar']['time'].val(step['Tempo']);
        // - Dreno
        this.set_image_active('centrifugar', 'dreno_1', 'dreno_1', step['Dreno']);
        // - Reuso
        this.set_image_active('centrifugar', 'dreno_2', 'dreno_2', step['Reuso']);

        this.step = step;
        this.manage_disponibility_buttons();
        this.manage_back();
    }

    /**
     * @brief Exporta a receita em um arquivo JSON com o nome digitado
     */
    receita_save() {
        // Nome da Receita já informada
        if(this.receita['programName'].trim() != "") {
            console.log("Receita Para Editar");
        } else {
            // Pegando nome da receita
            this.receita['programName'] = this.elements['save']['input'].val().trim();
            // Definindo nome do arquivo
            let receita_name    = `${this.elements['save']['input'].val()}.json`;
            // Criando blob para download
            let receita_blob    = new Blob([JSON.stringify(this.receita)], { type : 'text/json;charset=utf-8' });
            // Criando elemento para download
            let receita_link    = document.createElement("a");
            // Criando URL para download
            let receita_url     = URL.createObjectURL(receita_blob);
            
            receita_link.setAttribute("href", receita_url);
            receita_link.setAttribute("download", receita_name);

            receita_link.click();

            // Voltando telas
            $("#screen").css("display", "flex");
            this.elements['save']['container'].css("display", "none");
        }
    }

    /**
     * 
     * @param {?} event elemento vindo do evento de arrastar um arquivo
     */
    receita_import(event) {
        /**
         * 
         * @param {String} message mensagem para exibir
         * @param {JQuery Element} message_element elemento para exibir a mensagem
         */            
        function fail(message, message_element) {
            let original_color  = message_element.css("color");
            let original_text   = message_element.text();

            message_element.text(message);
            message_element.css("color", "rgb(255, 20, 20)");
            setTimeout(() => {
                message_element.css("color", original_color);
                message_element.text(original_text);
            }, 2000);
        }

        /**
         * 
         * @param {String} message mensagem para exibir
         * @param {JQuery Element} message_element elemento para exibir a mensagem
         */        
        function success(message, message_element) {
            let original_color  = message_element.css("color");
            let original_text   = message_element.text();

            message_element.text(message);
            message_element.css("color", "limegreen");
            setTimeout(() => {
                message_element.css("color", original_color);
                message_element.text(original_text);
            }, 2000);
        }

        event.preventDefault(); // Arquivo para ler
        let receita_file;

        if(event.type == 'change') {
            receita_file = this.elements['other']['import_receita_real'][0].files[0];
        } else {
            receita_file    = event.originalEvent.dataTransfer.items[0].getAsFile();
            if(!event.originalEvent.dataTransfer || event.originalEvent.dataTransfer.files.length <= 0) return false;
        }

        let result_element  = $("#screen_title", this.container)
        let receita_reader  = new FileReader();
        let step_index = $("#screen_step", this.container);

        // Arquivo incompatível
        if(receita_file.type && !receita_file.type.startsWith("application/json")) {
            fail("Arquivo Incompatível", result_element);
        }

        receita_reader.addEventListener("load", (e) => {
            if(!JSON.parse(e.target.result)['programName']) { return fail("Arquivo Incompatível", result_element); }
            this.receita = JSON.parse(e.target.result);
            this.step_index = 1;
            this.insert_step_data(this.receita[this.step_index - 1]);
            step_index.text(`Passo: ${this.step_index}`);
        });

        success("Receita carregada", result_element);

        receita_reader.readAsText(receita_file);
    }

    /**
     * @brief insere os inputs dos produtos 1 ~ 8
     */
    set_produtos() {
        // Adicionando produtos 1 ~ 8
        let container = $("#screen_stage_container_produtos_grid"/*, self.ctx.$container*/);
        for(let i = 0; i < 8; i++) {
            if(i < 4) { // Adicionando elementos da linha de cima
                container.append(
                    `
                    <div class="screen_stage_container_up screen_stage_item_grid_container" style="padding: 10px;">
                        <div class="screen_stage_produtos_item_container screen_stage_text_container">
                            <label for="screen_produto_${i+1}">
                                <span class="screen_text"> Produto ${i+1} </span>
                            </label>
                        </div>
                        <div class="screen_stage_produtos_item_container screen_stage_input_container" id="screen_produto_${i+1}_container" style="width: 50%; max-width: none;">
                            <input class="screen_input" id="screen_produto_${i+1}" type="number" value="0" style="max-width: none !important;">
                        </div>
                    </div>
                    `
                );
            } else { // Adicionando elementos da linha de baixo
                container.append(
                    `
                    <div class="screen_stage_container_bottom screen_stage_item_grid_container" style="padding: 10px;">
                        <div class="screen_stage_produtos_item_container screen_stage_text_container">
                            <label for="screen_produto_${i+1}">
                                <span class="screen_text"> Produto ${i+1} </span>
                            </label>
                        </div>
                        <div class="screen_stage_produtos_item_container screen_stage_input_container" id="screen_produto_${i+1}_container" style="width: 50%; max-width: none;">
                            <input class="screen_input" id="screen_produto_${i+1}" type="number" value="0" style="max-width: none !important;">
                        </div>
                    </div>
                    `
                );
            }
        }
    }

    /**
     * @brief Função que insere os nomes das receitas no select
     */
    set_receita_names() {
        this.load_receita_names();

        let interval = setInterval(() => {
            if(!this.receita_names) {
                clearInterval(interval);
                return;
            }

            if(this.receita_names.length > 0) {
                this.receita_names.forEach((receita) => {
                    this.elements['data']['select_receita']['select'].append(new Option(receita, receita, false, false));
                });
                clearInterval(interval);
            }
        }, 100);
    }

    /**
     * @brief Função que carrega os nomes das receitas exitentes na máquina
     */
    load_receita_names() {        
        this.attributeService.getEntityAttributes(this.entity_id, "SHARED_SCOPE", ["receita_names"]).subscribe((attr) => {
            this.receita_names  = (attr[0] == undefined ? false : attr[0]);
        });
    }
};