@props(['title' => null, 'description' => null])
<section class="qd-title-block">
    <h2 @class(['qd-title-muted' => ! filled($title)])>{{ filled($title) ? $title : 'Titolo del preventivo' }}</h2>
    @if (filled($description))
        <p class="qd-description">{{ $description }}</p>
    @endif
</section>
