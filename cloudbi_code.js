let pg_receita_image;

let options_geral       = {};   // JSON contendo os elementos gerais de lavagem
let options_lavar       = {};   // JSON contendo os elementos da tela de Lavar
let options_aquecer     = {};   // JSON contendo os elementos da tela de aquecer
let options_produtos    = {};   // JSON contendo os elementos da tela dos produtos
let options_centrifugar = {};   // JSON contendo os elementos da tela de centrifugação
let options_buttons     = {};   // JSON contendo os elementos dos botões de programação da receita
let receita_object      = [];   // Objeto final da receita (contém a receita pronta)
let receita_json        = {};   // JSON final da receita
let receita_data        = {
    "Carregar"      : false,
    "Lavar"         : false,
    "Centrifugar"   : false,
    "dreno_1"       : false,
    "descarregar"   : false,
    "dreno_2"       : false
};   // JSON temporário para a receita (contém a configuração do passo atual)

// Quando o widget for carregado
self.onInit = function() {
    pg_receita_image = new WidgetImages();
    
    pg_receita_get_elements_geral();        // Obtendo elementos gerais
    pg_receita_get_elements_lavar();        // Obtendo elementos de Lavar
    pg_receita_get_elements_aquecer();      // Obtendo elementos de aquecimento da água
    pg_receita_get_elements_produtos();     // Obtendo elementos dos produtos
    pg_receita_get_elements_centrifugar();  // Obtendo elementos da centrifugação
    pg_receita_get_elements_buttons();      // Obtendo elementos da centrifugação
    pg_receita_set_images();                // Inserindo as imagens nos elementos
    pg_receita_set_clicks();                // Configurando as funções para os clicks

    setInterval(() => {
        pg_receita_buttons_manage();        // Verificando se pode ou não liberar os botões da programação da receita
    }, 250);

    receita_data["step_index"] = 1;
    options_geral["step_index"].text(String("Passo: ") + String(receita_data["step_index"]));
    receita_data["relacao_ml_s"] = true; // Mililitros
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Funções iniciais do widget

function pg_receita_set_clicks() {
    options_geral["Carregar"].on("click", () =>  pg_receita_carregar_maquina());
    options_geral["Lavar"].on("click", () => pg_receita_lavar());
    options_geral["Centrifugar"].on("click", () => pg_receita_centrifugar());
    options_geral["Dreno"].on("click", () => pg_receita_dreno());
    options_geral["Descarregar"].on("click", () => pg_receita_descarregar_maquina());
    options_geral["Reuso"].on("click", () => pg_receita_reuso());

    options_lavar["agua_1"].on("click", () => pg_receita_lavar_agua_1());
    options_lavar["baixo"].on("click", () => pg_receita_lavar_nivel_baixo());
    options_lavar["medio"].on("click", () => pg_receita_lavar_nivel_medio());
    options_lavar["alto"].on("click", () => pg_receita_lavar_nivel_alto());
    options_lavar["agua_2"].on("click", () => pg_receita_lavar_agua_2());
    options_lavar["aquecer"].on("click", () => pg_receita_screen_lavar_aquecer());
    options_lavar["produtos"].on("click", () => pg_receita_screen_produtos());
    options_lavar["back"].on("click", () => pg_receita_lavar_back());

    options_aquecer["aquecimento"].on("click", () => pg_receita_lavar_aquecer_aquecimento());
    options_aquecer["patamar"].on("click", () => pg_receita_lavar_aquecer_patamar());
    options_aquecer["manter"].on("click", () => pg_receita_lavar_aquecer_manter());
    options_aquecer["back"].on("click", () => pg_receita_lavar_aquecer_back());

    options_produtos["produto_unidade"].on("click", () => pg_receita_lavar_produtos_medida());
    options_produtos["back"].on("click", () => pg_receita_lavar_produtos_back());

    options_centrifugar["dreno_1"].on("click", () => pg_receita_centrifugar_dreno_1());
    options_centrifugar["dreno_2"].on("click", () => pg_receita_centrifugar_dreno_2());
    options_centrifugar["back"].on("click", () => pg_receita_centrifugar_back());

    options_buttons["back"].on("click", () => pg_receita_button_back());
    options_buttons["next"].on("click", () => pg_receita_button_next());
    options_buttons["insert"].on("click", () => pg_receita_button_insert());
    options_buttons["delete"].on("click", () => pg_receita_button_delete());
    options_buttons["finish"].on("click", () => pg_receita_button_box_finish());

    $("#pg_receita_save").on("click", () => pg_receita_button_finish());
}

/**
 * @brief Função para obter os elementos gerais do widget
 */
function pg_receita_get_elements_geral() {
    options_geral["Carregar"]       = $("#pg_receita_options_carregar");
    options_geral["Lavar"]          = $("#pg_receita_options_lavar");
    options_geral["Centrifugar"]    = $("#pg_receita_options_centrifugar");
    options_geral["Dreno"]          = $("#pg_receita_options_dreno");
    options_geral["Descarregar"]    = $("#pg_receita_options_descarregar");
    options_geral["Reuso"]          = $("#pg_receita_options_reuso");
    options_geral["StepName"]       = $("#pg_receita_step_name_input");
    options_geral["step_index"]     = $("#pg_receita_top_bar_step_index");
}

/**
 * @brief Função para obter os elementos de Lavar do widget
 */
function pg_receita_get_elements_lavar() {
    options_lavar["tempo"]      = $("#pg_receita_step_time_input");
    options_lavar["agua_1"]     = $("#pg_receita_options_lavar_agua_1");
    options_lavar["baixo"]      = $("#pg_receita_options_lavar_baixo");
    options_lavar["medio"]      = $("#pg_receita_options_lavar_medio");
    options_lavar["alto"]       = $("#pg_receita_options_lavar_alto");
    options_lavar["agua_2"]     = $("#pg_receita_options_lavar_agua_2");
    options_lavar["aquecer"]    = $("#pg_receita_options_lavar_aquecer");
    options_lavar["produtos"]   = $("#pg_receita_options_lavar_produtos");
    options_lavar["back"]       = $("#pg_receita_options_lavar_back");
}

/**
 * @brief Função para obter os elementos de Aquecimento do widget
 */
function pg_receita_get_elements_aquecer() {
    options_aquecer["aquecimento"]  = $("#pg_receita_options_lavar_aquecer_input");
    options_aquecer["setpoint"]     = $("#pg_receita_options_lavar_setpoint_input");
    options_aquecer["patamar"]      = $("#pg_receita_options_lavar_patamar_input");
    options_aquecer["manter"]       = $("#pg_receita_options_lavar_manter_input");
    options_aquecer["back"]         = $("#pg_receita_options_lavar_aquecer_back");
}

/**
 * @brief Função para obter os elementos dos produtos do Widget
 */
function pg_receita_get_elements_produtos() {
    options_produtos["produto_1"]       = $("#pg_receita_options_input_produto_1");
    options_produtos["produto_2"]       = $("#pg_receita_options_input_produto_2");
    options_produtos["produto_3"]       = $("#pg_receita_options_input_produto_3");
    options_produtos["produto_4"]       = $("#pg_receita_options_input_produto_4");
    options_produtos["produto_5"]       = $("#pg_receita_options_input_produto_5");
    options_produtos["produto_6"]       = $("#pg_receita_options_input_produto_6");
    options_produtos["produto_7"]       = $("#pg_receita_options_input_produto_7");
    options_produtos["produto_8"]       = $("#pg_receita_options_input_produto_8");
    options_produtos["produto_unidade"] = $("#pg_receita_options_input_produto_medida");

    options_produtos["back"]            = $("#pg_receita_options_lavar_produtos_back");
}

/**
 * @brief Função para obter os elemetos da centrifugação
 */
function pg_receita_get_elements_centrifugar() {
    options_centrifugar["tempo"]    = $("#pg_receita_options_centrifugar_tempo_input");
    options_centrifugar["dreno_1"]  = $("#pg_receita_options_centrifugar_dreno_1");
    options_centrifugar["dreno_2"]  = $("#pg_receita_options_centrifugar_dreno_2");
    options_centrifugar["back"]     = $("#pg_receita_options_centrifugar_back");
}

/**
 * @brief Função para obter os elementos dos botões da programação da receita
 */
function pg_receita_get_elements_buttons() {
    options_buttons["back"]     = $("#pg_receita_buttons_btn_back");
    options_buttons["next"]     = $("#pg_receita_buttons_btn_next");
    options_buttons["insert"]   = $("#pg_receita_buttons_btn_insert");
    options_buttons["delete"]   = $("#pg_receita_buttons_btn_delete");
    options_buttons["finish"]   = $("#pg_receita_buttons_btn_finish");
}

/**
 * @brief Função para colocar as imagens nos elementos do widget
 */
function pg_receita_set_images() {
    $("#pg_receita_top_bar_logo").attr("src", pg_receita_image.logo);
    $("#pg_receita_step_time_icon").attr("src", pg_receita_image.time);

    options_geral["Carregar"].attr("src", pg_receita_image.carregar_off);
    options_geral["Lavar"].attr("src", pg_receita_image.lavar_off);
    options_geral["Centrifugar"].attr("src", pg_receita_image.centrifugar_off);
    options_geral["Dreno"].attr("src", pg_receita_image.dreno_1_off);
    options_geral["Descarregar"].attr("src", pg_receita_image.descarregar_off);
    options_geral["Reuso"].attr("src", pg_receita_image.dreno_2_off);

    options_lavar["agua_1"].attr("src", pg_receita_image.agua_1_off);
    options_lavar["baixo"].attr("src", pg_receita_image.nivel_baixo_off);
    options_lavar["medio"].attr("src", pg_receita_image.nivel_medio_off);
    options_lavar["alto"].attr("src", pg_receita_image.nivel_alto_off);
    options_lavar["agua_2"].attr("src", pg_receita_image.agua_2_off);
    options_lavar["aquecer"].attr("src", pg_receita_image.temperatura);
    options_lavar["produtos"].attr("src", pg_receita_image.produtos);
    options_lavar["back"].attr("src", pg_receita_image.back);

    options_aquecer["back"].attr("src", pg_receita_image.back);
    options_produtos["back"].attr("src", pg_receita_image.back);

    options_centrifugar["dreno_1"].attr("src", pg_receita_image.dreno_1_off);
    options_centrifugar["dreno_2"].attr("src", pg_receita_image.dreno_2_off);
    options_centrifugar["back"].attr("src", pg_receita_image.back);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Função para editar uma receita existente
// Volta o título para o formato original
function pg_receita_drop_js_reset() {
    $("#pg_receita_drop_js_title").text("Arraste uma receita já existente para editá-la");
    $("#pg_receita_drop_js_title").css("color", "rgb(7, 90, 164);");
}


// Erro ao carregar receita
function pg_receita_drop_json_fail(pg_receita_error_msg) {
    $("#pg_receita_drop_js_title").text(String("Erro: " + pg_receita_error_msg));
    $("#pg_receita_drop_js_title").css("color",  "red");

    setTimeout(() => { pg_receita_drop_js_reset(); }, 3000);
}

// Receita carregada com sucesso
function pg_receita_drop_json_success() {
    $("#pg_receita_drop_js_title").text("Receita carregada com sucesso");
    $("#pg_receita_drop_js_title").css("color",  "limegreen");

    setTimeout(() => { pg_receita_drop_js_reset(); }, 3000);
}

// Quando a receita for enviada para a página
function pg_receita_drop_json(pg_receita_event) {
    pg_receita_event.preventDefault();
    if(pg_receita_event.dataTransfer.files[0] === undefined) return;
    
    let pg_receita_file = pg_receita_event.dataTransfer.items[0].getAsFile();
    let pg_receita_reader = new FileReader();
    let pg_receita_file_data = "";

    if(pg_receita_file.type && !pg_receita_file.type.startsWith("application/json")) {
        return pg_receita_drop_json_fail("Arquivo incompátivel");
    }


    $("#pg_receita_drop_js_title").text("Carregando receita...");

    pg_receita_reader.addEventListener("load", (e) => {
        if(!JSON.parse(e.target.result)["programName"]) { return pg_receita_drop_json_fail("Arquivo incompatível"); }
        pg_receita_drop_json_success();

        pg_receita_file_data = e.target.result;
        receita_object = JSON.parse(pg_receita_file_data);
        receita_data["step_index"] = 1;
        pg_receita_insert_data();
    });
    pg_receita_reader.readAsText(pg_receita_file);

}

// ------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @brief Função que prepara os elementos para a tela de Lavar
 */
function pg_receita_screen_lavar() {
    // Mostrando tela para configuração de Lavar
    $("#pg_receita_buttons_list").css("display", "none");         // Escondendo os botões de programação
    $("#pg_receita_options_list_geral").css("display", "none");   // Escondendo as opções gerais de lavagem
    $("#pg_receita_options_list_lavar").css("display", "flex");   // Mostrando as opções de Lavar
    $("#pg_receita_step_name").css("display", "none");            // Escondendo o input do nome do passo
    $("#pg_receita_step_time").css("display", "flex");            // Mostrando o input para tempo do passo

    $("#pg_receita_top_bar_title").text("Configurações da Lavagem");

    pg_receita_disable(options_lavar["back"]);
    options_lavar["interval"] = setInterval(() => {
        pg_receita_button_manage_back_lavar();
    }, 300);
}

/**
 * @brief Função que prepara os elementos para a tela de aquecimento da água
 */
function pg_receita_screen_lavar_aquecer() {
    $("#pg_receita_top_bar_title").text("Configurações do Aquecimento");
    $("#pg_receita_step_time").css("display", "none");
    $("#pg_receita_options_list_lavar").css("display", "none");
    $("#pg_receita_options_list_aquecer").css("display", "flex");
    options_aquecer["interval"] = setInterval(() => {
        pg_receita_button_manage_back_aquecer();
    }, 300);
    pg_receita_disable(options_aquecer["back"]);
}

/**
 * @brief Função que prepara os elementos para a tela dos produtos
 */
function pg_receita_screen_produtos() {
    $("#pg_receita_top_bar_title").text("Adicionar Produtos");
    $("#pg_receita_step_time").css ("display", "none");
    $("#pg_receita_options_list_lavar").css ("display", "none");
    $("#pg_receita_options_list_produtos").css ("display", "flex");
}

/**
 * @brief Função que prepara os elementos para a tela de centrifugação
 */
function pg_receita_screen_centrifugar() {
    $("#pg_receita_top_bar_title").text("Configuração da Centrifugação");
    pg_receita_disable(options_centrifugar["back"]);
    $("#pg_receita_options_list_geral").css("display",  "none");
    $("#pg_receita_buttons_list").css("display",  "none");
    $("#pg_receita_options_list_centrifugar").css("display",  "flex");
    $("#pg_receita_step_name").css("display",  "none");
    options_centrifugar["interval"] = setInterval(() => {
        pg_receita_button_manage_back_centrifugar();
    }, 300);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Helpers
/**
 * @brief Função para desativar os eventos de click de um elemento
 * 
 * @param pg_receita_element elemento que será desativado
 */
function pg_receita_disable(pg_receita_element) { pg_receita_element.css({"opacity" : "0.7", "pointer-events" : "none"}); }

/**
 * @brief Função para ativar os eventos de click de um elemento
 * 
 * @param pg_receita_element elemento que será ativado
 */
function pg_receita_enable(pg_receita_element) { pg_receita_element.css({"opacity" : "1", "pointer-events" : "all"}); }

/**
 * @brief Função para setar o src de uma imagem
 * 
 * @param image_name
 */
function pg_receita_set_src(pg_set_element, pg_set_img_name) { pg_set_element.attr("src", pg_set_img_name); }

/**
 * @brief Função que altera o style das opções da receita
 * 
 * @param pg_array Objeto com os elementos para serem alterados
 * @param pg_index O índice do objeto que disparou as ações (se tiver selecionado Carregar Máquina, passar "Carregar" de options_geral)
 * @param pg_name_image Nome da imagem para ser substituído
 * @param switch_style true / false para controlar o comportamento da função
 */
function pg_receita_switch_style(pg_array, pg_index, pg_name_image, switch_style) {
    for(let index in pg_array) {
        if(switch_style) { // Ativar
            if(index != pg_index && index != "StepName" && index != "step_index") { pg_receita_disable(pg_array[index]); }
        } else if(index != "StepName" && index != "step_index") { pg_receita_enable(pg_array[index]); }
    }

    pg_receita_set_src(pg_array[pg_index], pg_name_image);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Funções gerais (lavar, centrifugar, carregar, etc.)
// - Carregar
function pg_receita_carregar_maquina() { 
    if(receita_data["Carregar"]) { // Desativar
        pg_receita_switch_style(options_geral, "Carregar", pg_receita_image.carregar_off, false);
        receita_data["Carregar"] = false;
    } else { // Ativar
        pg_receita_switch_style(options_geral, "Carregar", pg_receita_image.carregar_on, true);
        receita_data["Carregar"] = true
    }
}

// - Lavar
function pg_receita_lavar() {
    if(receita_data["Lavar"]) { // Desativar
        pg_receita_switch_style(options_geral, "Lavar", pg_receita_image.lavar_off, false);
        receita_data["Lavar"] = false;
    } else { // Ativar
        pg_receita_switch_style(options_geral, "Lavar", pg_receita_image.lavar_on, true);
        receita_data["Lavar"] = true;
        pg_receita_screen_lavar();
    }

}

// - Centrifugar
function pg_receita_centrifugar() {
    if(receita_data["Centrifugar"]) { // Desativar
        pg_receita_switch_style(options_geral, "Centrifugar", pg_receita_image.centrifugar_off, false);
        receita_data["Centrifugar"] = false;
    }
    else { // Ativar
        pg_receita_screen_centrifugar();
        pg_receita_switch_style(options_geral, "Centrifugar", pg_receita_image.centrifugar_on, true);
        receita_data["Centrifugar"] = true;
    }

}

// - Dreno
function pg_receita_dreno() {
    if(receita_data["Dreno"]) { // Desativar
        pg_receita_switch_style(options_geral, "Dreno", pg_receita_image.dreno_1_off, false);
        receita_data["Dreno"] = false;
    } else { // Ativar
        pg_receita_switch_style(options_geral, "Dreno", pg_receita_image.dreno_1_on, true);
        receita_data["Dreno"] = true;
    }
}

// - Descarregar
function pg_receita_descarregar_maquina() {
    if(receita_data["Descarregar"]) { // Desativar
        pg_receita_switch_style(options_geral, "Descarregar", pg_receita_image.descarregar_off, false);
        receita_data["Descarregar"] = false;
    } else { // Ativar
        pg_receita_switch_style(options_geral, "Descarregar", pg_receita_image.descarregar_on, true);
        receita_data["Descarregar"] = true;
    }
}

// - Reuso (dreno 2)
function pg_receita_reuso() {
    if(receita_data["Reuso"]) { // Desativar
        pg_receita_switch_style(options_geral, "Reuso", pg_receita_image.dreno_2_off, false);
        receita_data["Reuso"] = false;
    }
    else { // Ativar
        pg_receita_switch_style(options_geral, "Reuso", pg_receita_image.dreno_2_on, true);
        receita_data["Reuso"] = true;
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Funções Lavar (água 1, água 2, temperatura, etc.)
// - Voltar
function pg_receita_lavar_back() {
    $("#pg_receita_top_bar_title").text("Editar Receita da Lavadora");
    $("#pg_receita_buttons_list").css("display", "flex");
    $("#pg_receita_options_list_lavar").css("display", "none");
    $("#pg_receita_options_list_geral").css("display", "flex");
    $("#pg_receita_step_time").css("display", "none");
    $("#pg_receita_step_name").css("display", "flex");
    clearInterval(options_lavar["interval"]);
}

// - Água 1
function pg_receita_lavar_agua_1() {
    if(receita_data["AguaFria"]) { // Desativar
        pg_receita_enable(options_lavar["agua_2"]);
        pg_receita_set_src(options_lavar["agua_1"], pg_receita_image.agua_1_off);
        receita_data["AguaFria"] = false;
    } else { // Ativar
        pg_receita_disable(options_lavar["agua_2"]);
        pg_receita_set_src(options_lavar["agua_1"], pg_receita_image.agua_1_on);
        receita_data["AguaFria"] = true;
    }
}

// - Nível de água
// -- Baixo
function pg_receita_lavar_nivel_baixo() {
    pg_receita_set_src(options_lavar["baixo"], pg_receita_image.nivel_baixo_on);
    pg_receita_set_src(options_lavar["medio"], pg_receita_image.nivel_medio_off);
    pg_receita_set_src(options_lavar["alto"], pg_receita_image.nivel_alto_off);
    
    receita_data["NivelAgua"] = 1;
}

// -- Médio
function pg_receita_lavar_nivel_medio() {
    pg_receita_set_src(options_lavar["baixo"], pg_receita_image.nivel_baixo_off);
    pg_receita_set_src(options_lavar["medio"], pg_receita_image.nivel_medio_on);
    pg_receita_set_src(options_lavar["alto"], pg_receita_image.nivel_alto_off);

    receita_data["NivelAgua"] = 2;
}

// -- Alto
function pg_receita_lavar_nivel_alto() {
    pg_receita_set_src(options_lavar["baixo"], pg_receita_image.nivel_baixo_off);
    pg_receita_set_src(options_lavar["medio"], pg_receita_image.nivel_medio_off);
    pg_receita_set_src(options_lavar["alto"], pg_receita_image.nivel_alto_on);

    receita_data["NivelAgua"] = 3;
}

// - Água 2
function pg_receita_lavar_agua_2() {
    if(receita_data["AguaQuente"]) { // Desativar
        pg_receita_enable(options_lavar["agua_1"]);
        pg_receita_set_src(options_lavar["agua_2"], pg_receita_image.agua_2_off);
        receita_data["AguaQuente"] = false;
    } else { // Ativar
        pg_receita_disable(options_lavar["agua_1"]);
        pg_receita_set_src(options_lavar["agua_2"], pg_receita_image.agua_2_on);
        receita_data["AguaQuente"] = true;
    }
}

// - Aquecer
// -- Voltar
function pg_receita_lavar_aquecer_back() {
    $("#pg_receita_top_bar_title").text("Configurações da Lavagem");
    $("#pg_receita_step_time").css("display", "flex");
    $("#pg_receita_options_list_aquecer").css("display", "none");
    $("#pg_receita_options_list_lavar").css("display", "flex");
    clearInterval(options_aquecer["interval"]);
}

// -- Ligar / desligar
function pg_receita_lavar_aquecer_aquecimento() {
    if(receita_data["AquecerAgua"]) { // Desativar
        options_aquecer["aquecimento"].val("Desligado");
        options_aquecer["aquecimento"].css("background-color", "rgb(98, 125, 180)");

        receita_data["AquecerAgua"] = false;
    } else {
        options_aquecer["aquecimento"].val("Ligado");
        options_aquecer["aquecimento"].css("background-color", "rgb(0, 129, 255)");
        
        receita_data["AquecerAgua"] = true;
    }
}

// -- Aguardar Patamar
function pg_receita_lavar_aquecer_patamar() {
    if(receita_data["aguardarPatamar"]) { // Desativar
        options_aquecer["patamar"].val("Não");
        options_aquecer["patamar"].css("background-color", "rgb(98, 125, 180)");

        receita_data["aguardarPatamar"] = false;
    } else {
        options_aquecer["patamar"].val("Sim");
        options_aquecer["patamar"].css("background-color", "rgb(0, 129, 255)");
        receita_data["aguardarPatamar"] = true;
    }
}

// -- Manter Temperatura
function pg_receita_lavar_aquecer_manter() {
    if(receita_data["manterAquecido"]) { // Desativar
        options_aquecer["manter"].val("Não");
        options_aquecer["manter"].css("background-color", "rgb(98, 125, 180)");

        receita_data["manterAquecido"] = false;
    } else {
        options_aquecer["manter"].val("Sim");
        options_aquecer["manter"].css("background-color", "rgb(0, 129, 255)");
        receita_data["manterAquecido"] = true;
    }
}

// - Produtos
function pg_receita_lavar_produtos_back() {
    $("#pg_receita_top_bar_title").val("Configurações da Lavagem");
    $("#pg_receita_step_time").css("display", "flex");
    $("#pg_receita_options_list_produtos").css("display", "none");
    $("#pg_receita_options_list_lavar").css("display", "flex");
}

// - Medida
function pg_receita_lavar_produtos_medida() {
    if(receita_data["relacao_ml_s"]) { // Trocar para segundos
        receita_data["relacao_ml_s"] = false;
        options_produtos["produto_unidade"].css({"background-color" : "rgb(7, 90, 164)", "width" : "100%"});
        options_produtos["produto_unidade"].val("Segundos");
    } else {
        receita_data["relacao_ml_s"] = true;
        options_produtos["produto_unidade"].css({"background-color" : "rgb(98, 125, 180)", "width" : "100%"});
        options_produtos["produto_unidade"].val("Mililitros");
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Funções Centrifugar
// - Dreno
function pg_receita_centrifugar_dreno_1() {
    if(receita_data["Dreno"]) return;
    receita_data["Dreno"] = true;
    receita_data["Reuso"] = false;
    options_centrifugar["dreno_1"].attr("src", pg_receita_image.dreno_1_on);
    options_centrifugar["dreno_2"].attr("src", pg_receita_image.dreno_2_off);
}

function pg_receita_centrifugar_dreno_2() {
    if(receita_data["Reuso"]) return;
    receita_data["Dreno"] = false;
    receita_data["Reuso"] = true;
    options_centrifugar["dreno_1"].attr("src", pg_receita_image.dreno_1_off);
    options_centrifugar["dreno_2"].attr("src", pg_receita_image.dreno_2_on);
}

function pg_receita_centrifugar_back() {
    $("#pg_receita_top_bar_title").text("Editar Receita da Lavadora");
    $("#pg_receita_buttons_list").css("display", "flex");
    $("#pg_receita_options_list_centrifugar").css("display", "none");
    $("#pg_receita_options_list_geral").css("display", "flex");
    $("#pg_receita_step_time").css("display", "none");
    $("#pg_receita_step_name").css("display", "flex");
    clearInterval(options_centrifugar["interval"]);
}





// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Botões durante a programação da receita
function pg_receita_button_manage_back_lavar() {
    if(!receita_data["AguaFria"] && !receita_data["AguaQuente"]) { return pg_receita_disable(options_lavar["back"]); }
    if(!receita_data["NivelAgua"] && !receita_data["NivelAgua"] && !receita_data["NivelAgua"]) { return pg_receita_disable(options_lavar["back"]); }
    if(Number(options_lavar["tempo"].val()) < 1) { return pg_receita_disable(options_lavar["back"]); }
    
    pg_receita_enable(options_lavar["back"]);
}

function pg_receita_button_manage_back_aquecer() {
    if(receita_data["AquecerAgua"]) {
        if(Number(options_aquecer["setpoint"].val()) < 1) { return pg_receita_disable(options_aquecer["back"]); }
    }

    pg_receita_enable(options_aquecer["back"]);
}

function pg_receita_button_manage_back_centrifugar() {
    if(Number(options_centrifugar["tempo"].val()) < 1) { return pg_receita_disable(options_centrifugar["back"]); }
    if(!receita_data["Dreno"] && !receita_data["Reuso"]) { return pg_receita_disable(options_centrifugar["back"]); }

    pg_receita_enable(options_centrifugar["back"]);

}

// - Verificar se pode ou não liberar
function pg_receita_buttons_can_release() {
    if(options_geral["StepName"].val().length < 3) return false;

    if(!receita_data["Carregar"] && !receita_data["Lavar"] && !receita_data["Centrifugar"] && !receita_data["Descarregar"] && !receita_data["Dreno"] && !receita_data["Reuso"]) return false;

    return true;
}
// - Liberar e bloquear
function pg_receita_buttons_manage() {
    if(!pg_receita_buttons_can_release()) {
        pg_receita_disable(options_buttons["next"]);
        pg_receita_disable(options_buttons["insert"]);
        pg_receita_disable(options_buttons["finish"]);
    } else {
        pg_receita_enable(options_buttons["next"]);
        pg_receita_enable(options_buttons["insert"]);
        pg_receita_enable(options_buttons["finish"]);
    }
}

// - Voltar
function pg_receita_button_back() {
    if(pg_receita_buttons_can_release()) { pg_receita_append_json_final(); }

    if(receita_data["step_index"] <= 1) return;
    pg_receita_reset_elements();

    receita_data["step_index"]--;

    pg_receita_insert_data();
}

function pg_receita_insert_data() {
    let pg_receita_temp_step_index = receita_data["step_index"];

    receita_data = JSON.parse(JSON.stringify(receita_object[Number(receita_data["step_index"] - 1)]));


    receita_data["step_index"] = pg_receita_temp_step_index;

    options_geral["step_index"].text("Passo: " + Number(receita_data["step_index"]));


    options_geral["StepName"].val(receita_data["StepName"]);
    if(receita_data["Carregar"]) {
        receita_data["Carregar"] = false;
        pg_receita_carregar_maquina();
    } else if(receita_data["Descarregar"]) {
        receita_data["Descarregar"] = false;
        pg_receita_descarregar_maquina();
    } else if(receita_data["Dreno"] && !receita_data["Centrifugar"]) {
        receita_data["Dreno"] = false;
        pg_receita_dreno();
    } else if(receita_data["Reuso"] && !receita_data["Centrifugar"]) {
        receita_data["Reuso"] = false;
        pg_receita_reuso();
    }else if(receita_data["Lavar"]) {
        receita_data["Lavar"] = false;
        pg_receita_lavar();

        options_lavar["tempo"].val(receita_data["Tempo"]);

        console.clear();

        if(receita_data["NivelAgua"] == 1) { pg_receita_lavar_nivel_baixo(); }
        else if(receita_data["NivelAgua"] == 2) { pg_receita_lavar_nivel_medio(); }
        else if(receita_data["NivelAgua"] == 3) { pg_receita_lavar_nivel_alto(); }

        if(receita_data["AguaFria"]) {
            receita_data["AguaFria"] = false;
            pg_receita_lavar_agua_1();
        } else if(receita_data["AguaQuente"]) {
            receita_data["AguaQuente"] = false;
            pg_receita_lavar_agua_2();
        }

        if(receita_data["AquecerAgua"]) { // Aquecer Água
            receita_data["AquecerAgua"] = false;
            pg_receita_lavar_aquecer_aquecimento();
            options_aquecer["setpoint"].val(receita_data["TempAgua"]);
            if(receita_data["aguardarPatamar"]) {
                receita_data["aguardarPatamar"] = false;
                pg_receita_lavar_aquecer_patamar();
            } if(receita_data["manterAquecido"]) {
                receita_data["manterAquecido"] = false;
                pg_receita_lavar_aquecer_manter();
            }
        }

        for(let i=0; i < 8; i++) { options_produtos["produto_" + String(i+1)].val(receita_data[String("Soap") + String(i+1)]); }
        receita_data["relacao_ml_s"] = !receita_data["relacao_ml_s"];
        pg_receita_lavar_produtos_medida();

        pg_receita_lavar_back();
    } else if(receita_data["Centrifugar"]) {
        receita_data["Centrifugar"] = false;
        pg_receita_centrifugar();

        options_centrifugar["tempo"].val(receita_data["Tempo"]);
        if(options_centrifugar["dreno_1"]) {
            receita_data["Dreno"] = false;
            pg_receita_centrifugar_dreno_1();
        } else {
            receita_data["Reuso"] = false;
            pg_receita_centrifugar_dreno_2();
        }

        pg_receita_centrifugar_back();
    }
}

function pg_receita_button_next() {
    pg_receita_append_json_final();
    receita_data["step_index"]++;
    options_geral["step_index"].text("Passo: " + Number(receita_data["step_index"]));
    pg_receita_reset_elements();

    if(receita_object[receita_data["step_index"] - 1]) {
        pg_receita_insert_data();
    }
}

// Copiado do controlador
function pg_receita_button_insert() {
    let pg_receita_temp = 0;

    pg_receita_append_json_final();

    while(true) {
        if(receita_object[(receita_data["step_index"] - 1) + pg_receita_temp]) { pg_receita_temp++; }
        else { break; }
    }

    while(pg_receita_temp > 0) {
        receita_object[(receita_data["step_index"] - 1) + pg_receita_temp] = receita_object[(receita_data["step_index"] - 1) + (pg_receita_temp - 1)];
        pg_receita_temp--;
    }

    pg_receita_reset_elements();
    pg_receita_append_json_final();
}

// Deletar passo
function pg_receita_button_delete() {
    if(receita_data["step_index"] <= 1) { return pg_receita_reset_elements(); }

    receita_object.splice(receita_data["step_index"] - 1, 1);

    pg_receita_reset_elements();

    setTimeout(() => {
        pg_receita_button_back();        
    }, 100);
}

// Função que mostra a caixa para inserir o nome da receita
function pg_receita_button_box_finish() {
    document.body.querySelector("#pg_receita_finish_input").addEventListener("keydown", (e) => {
        if(e["keyCode"] == 13) { pg_receita_button_finish(); }
    });

    $("#pg_receita").css({
        "opacity"           : ".7",
        "z-index"           : "1",
        "background-color"  : "gray",
        "pointer-events"    : "none"
    });

    $("#pg_receita_buttons_list").css({
        "pointer-events"    : "none",
        "display"           : "none"
    });

    $("#pg_receita_finish_box_container").css({
        "position"          : "absolute",
        "flex-direction"    : "column",
        "border-radius"     : "15px",
        "padding"           : "2%",
        "z-index"           : "99",
        "top"               : "25%",
        "display"           : "flex",
        "background-color"  : "white",
        "pointer-events"    : "all"
    });
}

function pg_receita_button_finish() {
    $("#pg_receita").css({
        "opacity"           : "1",
        "background-color"  : "white",
        "pointer-events"    : "all"
    });

    $("#pg_receita_buttons_list").css({
        "display"           : "flex",
        "pointer-events"    : "all"
    });

    $("#pg_receita_finish_box_container").css ("display", "none");

    pg_receita_append_json_final();

    receita_object["programName"] = $("#pg_receita_finish_input").val();

    let pg_receita_blob_name = receita_object["programName"] + ".json";

    Object.keys(receita_object).forEach(index => {
        receita_json[String(index)] = receita_object[index];
    });

    let pg_receita_blob = new Blob([(JSON.stringify(receita_json))], { type: 'text/json;charset=utf-8;' });
    if(navigator.msSaveBlob) {
        navigator.msSaveBlob(pg_receita_blob, pg_receita_blob_name);
    } else {
        let link = document.createElement("a");
        if(link.download !== undefined) {
            let url = URL.createObjectURL(pg_receita_blob);
            link.setAttribute("href", url);
            link.setAttribute("download", pg_receita_blob_name);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Adicionar dados ao JSON final
function pg_receita_append_json_final() {
    let temp_json = {};

    temp_json["Lavar"]          = false;
    temp_json["Centrifugar"]    = false;
    temp_json["Carregar"]       = false;
    temp_json["Descarregar"]    = false;

    if(receita_data["Carregar"]) { temp_json["Carregar"] = true; } // Carregar
    else if(receita_data["Descarregar"]) { temp_json["Descarregar"] = true; } // Desacarregar
    else if(receita_data["Lavar"]) { // Lavar
        temp_json["Lavar"] = true;

        temp_json["Tempo"] = Number(options_lavar["tempo"].val());

        temp_json["NivelAgua"] = receita_data["NivelAgua"];

        if(receita_data["AguaFria"]) { // Água 1
            temp_json["AguaFria"] = true;
            temp_json["AguaQuente"] = false;
        } else { // Água 2
            temp_json["AguaFria"] = false;
            temp_json["AguaQuente"] = true;
        }

        if(receita_data["AquecerAgua"]) { // Aquecer
            temp_json["AquecerAgua"] = true;
            temp_json["TempAgua"] = Number(options_aquecer["setpoint"].val());
            temp_json["aguardarPatamar"] = (receita_data["aguardarPatamar"] ? true : false);
            temp_json["manterAquecido"] = (receita_data["manterAquecido"] ? true : false);
        } else { // Não aquecer
            temp_json["AquecerAgua"] = false;
            temp_json["TempAgua"] = 0;
            temp_json["aguardarPatamar"] = false;
            temp_json["manterAquecido"] = false;
        }

        for(let i=0; i < 8; i++) { temp_json[String("Soap") + String(i+1)] = Number(options_produtos[String("produto_") + String(i+1)].val()); }
        temp_json["relacao_ml_s"] = receita_data["relacao_ml_s"];

    } else if(receita_data["Centrifugar"]) { // Centrifugar
        temp_json["Centrifugar"] = true;
        temp_json["Tempo"] = Number(options_centrifugar["tempo"].val());
        temp_json["Dreno"] = (receita_data["Dreno"] ? true : false);
        temp_json["Reuso"] = (receita_data["Reuso"] ? true : false);
    } else if(receita_data["Dreno"]) { temp_json["Dreno"] = true; }
    else if(receita_data["Reuso"]) { temp_json["Reuso"] = true; }
    
    temp_json["StepName"] = options_geral["StepName"].val();

    receita_object[String(receita_data["step_index"] - 1)] = temp_json;
}

function pg_receita_reset_elements() {
    let _pg_receita_step_index = Number(receita_data["step_index"]);

    receita_data = { // Resetando JSON contendo os dados temporários da receita
        "Carregar"      : false,
        "Lavar"         : false,
        "Centrifugar"   : false,
        "Dreno"       : false,
        "Descarregar"   : false,
        "Reuso"       : false,
        "step_index"    : _pg_receita_step_index
    };

    // Resetando Geral
    pg_receita_set_src(options_geral["Carregar"], pg_receita_image.carregar_off);
    pg_receita_set_src(options_geral["Lavar"], pg_receita_image.lavar_off);
    pg_receita_set_src(options_geral["Centrifugar"], pg_receita_image.centrifugar_off);
    pg_receita_set_src(options_geral["Dreno"], pg_receita_image.dreno_1_off);
    pg_receita_set_src(options_geral["Descarregar"], pg_receita_image.descarregar_off);
    pg_receita_set_src(options_geral["Reuso"], pg_receita_image.dreno_2_off);
    for(let index in options_geral) {
        if(index != "StepName") { 
            pg_receita_enable(options_geral[index]);
        }
    }
    options_geral["StepName"].val("");

    // Resetando Lavar
    options_lavar["tempo"].val(0);
    pg_receita_set_src(options_lavar["agua_1"], pg_receita_image.agua_1_off);
    pg_receita_set_src(options_lavar["baixo"], pg_receita_image.nivel_baixo_off);
    pg_receita_set_src(options_lavar["medio"], pg_receita_image.nivel_medio_off);
    pg_receita_set_src(options_lavar["alto"], pg_receita_image.nivel_alto_off);
    pg_receita_set_src(options_lavar["agua_2"], pg_receita_image.agua_2_off);
    for(let index in options_lavar) {
        if(index != "back" && index != "interval") { 
            pg_receita_enable(options_lavar[index]);
        }
    }

    // - Resetando Aquecer
    options_aquecer["aquecimento"].val("Desligado");
    options_aquecer["aquecimento"].css("background-color", "rgb(98, 125, 180)");

    options_aquecer["setpoint"].val(0);

    options_aquecer["patamar"].val("Não");
    options_aquecer["patamar"].css("background-color", "rgb(98, 125, 180)");

    options_aquecer["manter"].val("Não");
    options_aquecer["manter"].css("background-color", "rgb(98, 125, 180)");

    // - Resetando Produtos
    for(let i=0; i < 8; i++) { options_produtos[String("produto_") + String(i+1)].val(0); }
    receita_data["relacao_ml_s"] = true;
    options_produtos["produto_unidade"].val("Mililitros");

    // Resetando Centrifugar
    options_centrifugar["tempo"].val(0);
    pg_receita_set_src(options_centrifugar["dreno_1"], pg_receita_image.dreno_1_off);
    pg_receita_set_src(options_centrifugar["dreno_2"], pg_receita_image.dreno_2_off);

}