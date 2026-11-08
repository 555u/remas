export const paintings = [
  { id:'realism', name:'Realism', detail:'Look at the ivory rose. One petal catches the moonlight while the petal just underneath it falls into shadow. That small change makes the bloom feel solid.', exercise:'Set one flower under a desk lamp. Paint only three values: light, middle, and shadow.', reason:'closely observed shapes and believable light', traits:[1,0,0], colors:['#2d2237','#91596b','#e5c5a6'] },
  { id:'impressionism', name:'Impressionism', detail:'Look at the short dabs of pink and violet around the flowers. Your eye blends them from a distance, so the light seems to flicker.', exercise:'Paint one flower by a window with small dabs. Use separate marks for warm light and cool shadow.', reason:'soft edges, broken brushwork, and gentle shifts of light', traits:[0,0,0], colors:['#514b72','#b67591','#e1cda8'] },
  { id:'expressionism', name:'Expressionism', detail:'Follow the slanted window and the bent stems. The lines lean and the magenta pushes against the violet, making the whole room feel restless.', exercise:'Paint a flower in the mood you’re in. Exaggerate its lean and give the shadow one unexpected color.', reason:'strong contrasts and shapes that bend with the mood', traits:[0,1,1], colors:['#382446','#a63d65','#d98b9c'] },
  { id:'abstract', name:'Abstract', detail:'Find the moon as a circle, then look for a vase in the blocks below. The shapes overlap just enough to hint at the room.', exercise:'Reduce the scene to a circle, an arch, and three color blocks. Move the shapes around before painting them.', reason:'simplified shapes and bold relationships between colors', traits:[1,1,1], colors:['#49324e','#9e5c7a','#d3a562'] },
  { id:'surrealism', name:'Surrealism', detail:'Look at how the rose and moon seem to hang in the room. The believable shadows make those impossible details feel strangely ordinary.', exercise:'Paint a simple vase, then hang a tiny moon from one of its stems. Give both the same direction of light.', reason:'believable details inside a dreamlike scene', traits:[1,1,0], colors:['#302337','#8a566e','#e0bf93'] },
  { id:'minimalism', name:'Minimalism', detail:'Notice how much empty plum space surrounds the blooms. A few clean shapes and the small moon are enough to suggest the whole scene.', exercise:'Paint two thin stems and one moon against a single flat background. Leave at least half of the surface empty.', reason:'clean edges, a quiet palette, and plenty of breathing room', traits:[1,0,0], colors:['#302332','#966d7c','#dfc5aa'] },
  { id:'pop', name:'Pop Art', detail:'Look at the thick contours and repeating dots. They make the rose read almost like a printed poster, even up close.', exercise:'Draw one flower with a bold outline. Fill it with a flat pink and make the shadow with a row of dots.', reason:'crisp outlines and punchy, graphic contrasts', traits:[1,0,1], colors:['#382240','#db537b','#efb455'] },
  { id:'decorative', name:'Decorative & Pattern-Based Painting', detail:'Trace the curling leaves and look for shapes that repeat around the arch. The repetition ties the flowers and window into one pattern.', exercise:'Paint a simple rose shape three times around a curve, alternating its direction. Fill the spaces with little leaves.', reason:'crisp details and repeated motifs', traits:[1,1,0], colors:['#4f354b','#a36a77','#d9b178'] },
];

export const comparisons = [
  { question:'Which edges pull you in?', options:['Soft, broken edges','Clean, crisp edges'], examples:['realism','realism'], effects:['soft-edge','crisp-edge'] },
  { question:'Which world would you spend time in?', options:['A believable scene','A dreamlike scene'], examples:['realism','surrealism'], effects:['',''] },
  { question:'Which colors feel more like you?', options:['Gentle shifts','Dramatic contrasts'], examples:['realism','realism'], effects:['gentle-color','dramatic-color'] }
];

export const paints = {
  acrylic: {name:'Acrylic', supplies:'Acrylic in white, rose, and blue, one flat brush, a water jar, a rag, and heavyweight paper or a canvas board.', exercise:'Spend 3 minutes mixing a midtone, a shadow, and a highlight. Block in a flower in 5 minutes. Give it 4 minutes to set, then add a 3-minute second layer where it feels dry.', pear:['Block in the pear with three flat values. Let each shape dry before adding the next.','Blend the light and middle colors while they’re wet. Work on one small patch at a time.','Use a nearly dry brush to drag a pale color across one side for speckled texture.']},
  watercolor: {name:'Watercolor', supplies:'A small watercolor set, a round brush, watercolor paper, a water jar, and a clean cloth.', exercise:'Make a pale wash for 5 minutes. While it’s damp, drop a stronger pink into one edge for another 5. Spend the last 5 minutes making a second wash with more white paper left showing.', pear:['Wet the pear silhouette and drop diluted yellow into the center. Watch it spread.','Paint a pale base and let it dry fully. Glaze a thin shadow over just one side.','Leave a patch of paper white. Touch stronger pigment into the damp shadow edge.']},
  gouache: {name:'Gouache', supplies:'Traditional gouache in white, rose, and blue, one small flat brush, a mixing palette, water, and heavyweight paper.', exercise:'Mix three small puddles of paint in 5 minutes. Paint a flat flower in 5. In the last 5, let it settle and add a cream accent with a lightly loaded brush.', pear:['Mix three opaque colors and paint the pear in flat interlocking shapes.','Rewet a little of the edge with a damp clean brush to soften a hard shadow.','Let the base dry, then stipple a few pale dots with thick paint and very little water.']},
  oils: {name:'Oils', supplies:'Water-mixable oil paint in white, rose, and blue, one brush, a primed board, a palette, and a place to leave wet work.', exercise:'Set out a primed board and mix three values for 5 minutes. Paint one simple petal in 5. Spend the last 5 softening only the shadow edge, then leave the board somewhere it can dry.', pear:['Lay in three neighboring values and soften only the middle transition with a clean brush.','Build a tiny area of texture with thicker paint, keeping the rest of the pear thin.','Paint the pear in one midtone, then pull a light stroke into the wet surface.']}
};

const opt = (label, tip, look, setup, swatch) => ({label, tip, look, setup, swatch});
export const questions = [
  { title:'What would you like your colors to do?', options:[
    opt('Let light wash through the color','Watercolor lets the paper shine through. A little more water makes a lighter wash.',[0,5,0,1],[], 'wash'),
    opt('Sit flat and matte','Traditional gouache gives you opaque, matte shapes. Use just enough water for the brush to glide.',[1,0,5,0],[], 'matte'),
    opt('Leave thick, visible brushstrokes','Oils hold a ridge and stay wet longer. Heavy-body acrylic can give you a similar ridge with quicker drying.',[3,0,0,5],[], 'texture')] },
  { title:'How would you like to fix a mistake?', options:[
    opt('Paint over it once it dries','Dry acrylic stays put. Give the layer time to dry, then cover the spot with fresh paint.',[1,0,0,0],[4,0,1,1]),
    opt('Soften it with a damp brush','Traditional gouache reactivates with water. A damp brush can soften an edge, but scrubbing can disturb the whole layer.',[0,0,1,0],[0,1,4,0]),
    opt('Try lifting color back to the paper','Watercolor can sometimes lift with a clean damp brush. How much comes up depends on the pigment and paper.',[0,1,0,0],[0,4,1,0]),
    opt('Move it around while it’s still wet','Oils stay workable for longer. Wipe or move wet color before putting down a fresh stroke.',[0,0,0,1],[0,0,0,4])] },
  { title:'How do you like to blend?', options:[
    opt('Build it in quick layers','Acrylic dries quickly, which helps when you want a new layer to sit clearly over the first.',[3,1,1,0],[2,1,1,0]),
    opt('Let colors mingle in water','On damp paper, watercolor flows into neighboring color. The wetter the paper, the more it travels.',[0,3,1,0],[0,2,1,0]),
    opt('Take time to soften wet edges','Oils give you time to nudge a shadow softer. Small gouache blends can work if you move before they dry.',[0,0,1,3],[0,0,1,2])] },
  { title:'How much time do you usually have?', options:[
    opt('15–20 minutes, with quick cleanup','Acrylic, watercolor, and gouache clean up with water while wet. Rinse acrylic from the brush before it dries.',[],[5,5,5,0]),
    opt('About 45 minutes, then I pack away','Acrylic layers can dry during a session. Watercolor and gouache pack away easily once your page and tools are dry.',[],[4,3,4,1]),
    opt('I can leave a painting set up and come back','Oils suit a painting you’ll revisit. The work needs a safe place to stay while it’s wet.',[],[1,1,1,6])] },
  { title:'Where will you paint?', options:[
    opt('A small desk','Watercolor and gouache fit a small desk with paper, a brush, and one water jar. Use a mat to protect the surface.',[],[2,5,5,0]),
    opt('A shared table','Set down a washable mat. Water-based paints keep the setup simple and let you clear the table quickly.',[],[4,4,4,0]),
    opt('A dedicated painting space','A dedicated space gives oils room for a palette and a safe place to leave a wet board. Water-mixable oils simplify the setup.',[],[2,1,2,6])] },
  { title:'What sounds fun to practice first?', options:[
    opt('A soft sky wash','Watercolor on damp paper softens the edges for you. Leave a little dry paper where you want a crisp cloud.',[0,5,0,0],[]),
    opt('A flat flower shape','A creamy gouache mix makes an even silhouette. Paint it in one pass to keep the surface flat.',[2,0,5,0],[]),
    opt('A textured petal','A loaded brush leaves a raised stroke in heavy-body acrylic or oils. Try lifting the brush at the tip of the petal.',[5,0,1,3],[]),
    opt('A smooth shadow','Oils let you soften an edge slowly. Start with two neighboring values and blend only where they meet.',[1,0,1,5],[])] }
];

export const colorNames = ['Window shadow','Rose petal','Moonlit cream'];
export const mixingNotes = ['Start with ultramarine and a touch of burnt umber. Add a little red for a warmer plum.', 'Mix a little rose into white. A tiny dab of yellow ochre warms the pink.', 'Start with white and a trace of yellow ochre. In watercolor, dilute the ochre and leave paper showing.'];
