<?php
/**
 * Plugin Name: Reservas SaaS - Booking Widget
 * Plugin URI: https://reservas-saas.vercel.app
 * Description: Incrusta mágicamente el motor de reservas B2C de tu SaaS dentro de cualquier página de WordPress usando un Shortcode.
 * Version: 1.0.0
 * Author: Reservas SaaS
 * Author URI: https://reservas-saas.vercel.app
 */

// Evitar el acceso directo al archivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registra el shortcode [reservas_saas slug="mi-negocio"]
 */
function reservas_saas_render_widget( $atts ) {
    // Definir atributos por defecto
    $attributes = shortcode_atts( array(
        'slug'   => '',
        'height' => '800px',
        'width'  => '100%',
        'domain' => 'https://reservas-saas.vercel.app' // URL de producción de Next.js
    ), $atts );

    $slug = sanitize_text_field( $attributes['slug'] );
    $height = esc_attr( $attributes['height'] );
    $width = esc_attr( $attributes['width'] );
    $domain = esc_url( $attributes['domain'] );

    if ( empty( $slug ) ) {
        return '<p style="color:red; font-weight:bold;">Reservas SaaS Error: Falta el atributo "slug" en el shortcode. Ejemplo: [reservas_saas slug="mi-peluqueria"]</p>';
    }

    // Construir la URL del Iframe (Apunta al frontend de Vercel)
    $iframe_url = sprintf( '%s/booking/%s?embed=true', untrailingslashit( $domain ), $slug );

    // Retornar el HTML del widget incrustado
    ob_start();
    ?>
    <div class="reservas-saas-widget-container" style="width: <?php echo $width; ?>; max-width: 100%; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <iframe 
            src="<?php echo esc_url( $iframe_url ); ?>" 
            style="width: 100%; height: <?php echo $height; ?>; border: none; overflow-y: auto; background-color: transparent;"
            title="SaaS Booking Widget"
            allowtransparency="true"
        ></iframe>
    </div>
    
    <script>
        // Opcional: Script para intentar auto-ajustar la altura del iframe basándose en el contenido de Next.js
        window.addEventListener('message', function(e) {
            // Verificar que el mensaje venga de nuestro dominio de Vercel por seguridad
            if (e.origin !== "<?php echo untrailingslashit( $domain ); ?>") return;
            
            if (e.data && e.data.type === 'RESERVAS_SAAS_RESIZE') {
                const iframes = document.querySelectorAll('.reservas-saas-widget-container iframe');
                iframes.forEach(function(iframe) {
                    if (iframe.src.includes("<?php echo esc_js($slug); ?>")) {
                        iframe.style.height = e.data.height + 'px';
                    }
                });
            }
        });
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode( 'reservas_saas', 'reservas_saas_render_widget' );
