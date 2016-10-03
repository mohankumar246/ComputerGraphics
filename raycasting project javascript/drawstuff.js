/* classes */


class point_3d{

    constructor(a,b,c){
        try {
            if ((typeof(a) !== "number") || (typeof(b) !== "number") || (typeof(c) !== "number"))
                throw "point component not a number";
            else
                {
					this.x = a; this.y = b; this.z = c;
				}
        } // end try

        catch (e) {
            console.log(e);
        }
    }

    change(a,b,c){
        try {
            if ((typeof(a) !== "number") || (typeof(b) !== "number") || (typeof(c) !== "number"))
                throw "point component not a number";
            else
                {
					this.x = a; this.y = b; this.z = c;
				}
        } // end try

        catch (e) {
            console.log(e);
        }
    }
}

function add(a,b){
            return ({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
}

function sub(a,b){
            return ({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
}

function dot(a,b){
            return(a.x*b.x+a.y*b.y+a.z*b.z);
}


function mul_const(mul,val){
            return ({x:mul.x*val,y:mul.y*val,z:mul.z*val});
}

class ray{

    constructor(c,m){
        this.c = {x:c.x,y:c.y,z:c.z};
        this.m = {x:m.x,y:m.y,z:m.z};
    }

    change(c,m){
         this.c = {x:c.x,y:c.y,z:c.z};
        this.m = {x:m.x,y:m.y,z:m.z};
    }

    change_sub(l,r){
                this.c = {x:l.x,y:l.y,z:l.z};
                this.m = sub(r,l);
    }

}

/* utility functions */

function check_intersection(a,b,c)
{
    if((b*b - 4*a*c) >=0)
        return 1;
    else
        return 0;
}

function get_root_1(a,b,c)
{
    return ((1/(2*a))*(-b + Math.sqrt((b*b) - (4*a*c))));
}

function get_root_2(a,b,c)
{
    return ((1/(2*a))*(-b - Math.sqrt((b*b) - (4*a*c))));
}

function unit_vec(point_vec)
{
    var mag = Math.sqrt(point_vec.x*point_vec.x + point_vec.y*point_vec.y + point_vec.z*point_vec.z);

    point_vec.x = point_vec.x/mag;
    point_vec.y = point_vec.y/mag;
    point_vec.z = point_vec.z/mag;

   return point_vec;
}

function get_illumination(inputSphere,lights,pt_on_surf,eye_pix_ray)
{
    var normal      = unit_vec(sub(pt_on_surf,inputSphere));
    var viewer      = unit_vec(sub(eye_pix_ray.c,pt_on_surf));
    var n_dot_l     = [];
    var r_dot_v_p_n = [];

    for(var j=0; j< lights.length; j++)
    {
        var surf_light  = unit_vec(sub(lights[j],pt_on_surf));
        n_dot_l[j]      = dot(normal,surf_light);
        n_dot_l[j]      = n_dot_l[j] < 0 ? 0 : n_dot_l[j];
        var mirror_ref  = sub(mul_const(mul_const(normal,2),n_dot_l[j]),surf_light);
        var mirror_ref  = unit_vec(mirror_ref);
        r_dot_v_p_n[j]  = Math.pow(dot(mirror_ref,viewer),inputSphere.n);
        r_dot_v_p_n[j]  = r_dot_v_p_n[j] < 0 ? 0 : r_dot_v_p_n[j];
    }

    var illum       = [0,0,0];
    for(var i =0; i < 3; i++)
    {
        for(var j=0; j< lights.length; j++)
        {
            var ambient    = lights[j].ambient[i]   * inputSphere.ambient[i];
            var diffuse    = lights[j].diffuse[i]   * inputSphere.diffuse[i] * n_dot_l[j];
            var specular   = lights[j].specular[i]  * inputSphere.specular[i] * r_dot_v_p_n[j];
            illum[i]       += ambient + diffuse + specular;
        }

        illum[i] = illum[i]>1 ? 1 : illum[i];
     }

    return illum;

}
function check_and_draw_ray_sphere(eye_pix_ray,inputSpheres,row,col,imagedata,lights)
{
    var a         = dot(eye_pix_ray.m,eye_pix_ray.m);
    var pix_color = new Color(0,0,0,0);
    var e_minus_c = new point_3d(0,0,0);
    var root_spheres     = [];
    var color_spheres = [];

    for(var i=0;i<inputSpheres.length;i++)
    {
        e_minus_c     = sub(eye_pix_ray.c,inputSpheres[i]);
        var b         = 2*dot(eye_pix_ray.m,e_minus_c);
        var c         = dot(e_minus_c,e_minus_c) - (inputSpheres[i].r * inputSpheres[i].r);


        if(check_intersection(a,b,c))
        {
            var root1 = get_root_1(a,b,c);
            var root2 = get_root_2(a,b,c);

            var root;

            if(root1 < 1)
                root = root2;
            else if(root2 < 1)
                root = root1;
            else if(root1 > 1 && root2 > 1)
                root = (root1 > root2)? root2:root1;

            root_spheres.push(root);

            if(root > 1)
            {

                var pt_on_surf = get_point_on_ray(eye_pix_ray,root);

                var illum = get_illumination(inputSpheres[i],lights,pt_on_surf,eye_pix_ray);

                pix_color.change(
                illum[0]*255,
                illum[1]*255,
                illum[2]*255,
                255); // rand color

                color_spheres[i] = {'r': pix_color.r, 'g' : pix_color.g, 'b' :pix_color.b , 'a' :pix_color.a};

                /*drawPixel(imagedata,
                           row,
                           col,
                           pix_color);*/
            }
        }
        else
        {
            root_spheres.push(0);
            color_spheres[i] = {'r': 0, 'g' : 0, 'b' :0 , 'a' :0};
        }

         if(i == (inputSpheres.length - 1))
            {
                var min_root = 100000000;
                var min_index = -1;
                for(var j=0;j<inputSpheres.length; j++)
                {
                    if((root_spheres[j] < min_root) && ( 1 < root_spheres[j]))
                    {
                        min_root = root_spheres[j];
                        min_index = j;
                    }
                }

                if(min_index > -1)
                 {
                     pix_color.change(
                        color_spheres[min_index].r,
                        color_spheres[min_index].g,
                        color_spheres[min_index].b,
                        color_spheres[min_index].a);

                    drawPixel(imagedata,
                           row,
                           col,
                           pix_color);
                 }
            }
    }

}
function get_point_on_ray(edge,val)
{
   return (add(edge.c,mul_const(edge.m,val)));

}
function ray_casting(context){

    var eye          = new point_3d(0.5,0.5,-0.5);
    var upper_left   = new point_3d(0,1,0);
    var lower_left   = new point_3d(0,0,0);
    var upper_right  = new point_3d(1,1,0);
    var lower_right  = new point_3d(1,0,0);
    var lookup       = new point_3d(0,1,0);
    var lookat       = new point_3d(0,0,1);
    var window_dis   = 0.5;
    var light        = {"color": {"amb": 1, "diff":1, "spec": 1}, "position" : new point_3d(2,2,-2)};
    var left_edge    = new ray(upper_left,lower_left);
    left_edge.m      = sub(lower_left,upper_left);
    var right_edge   = new ray(upper_right,lower_right);
    right_edge.m     = sub(lower_right,upper_right);

    var left_point   = new point_3d(0,0,0);
    var right_point  = new point_3d(0,0,0);
    var pixel        = new point_3d(0,0,0);
    var intr_edge    = new ray(lower_left,upper_right);
    var eye_pix_ray  = new ray(eye,left_point);
    var direc         = new point_3d(0,0,0);
    var inputSpheres = getInputSpheres();
    var lights       = getInputMultipleLights();
    var width        = context.canvas.width;
    var height       = context.canvas.height;

    var imagedata    = context.createImageData(width,height);

    if (inputSpheres != String.null) {
        for(var row = height-1; row >= 0 ; row--)
        {
             for(var col = 0; col < width;col++)
             {
                 left_point =  get_point_on_ray(left_edge,row/(height-1));
                 right_point = get_point_on_ray(right_edge,row/(height-1));

                 intr_edge.change_sub(left_point,right_point);
                 pixel = get_point_on_ray(intr_edge,col/(width-1));

                 direc = sub(pixel,eye);
                 eye_pix_ray.change(eye,direc);

                 check_and_draw_ray_sphere(eye_pix_ray,inputSpheres,col,row,imagedata,lights);
             }
        }
        context.putImageData(imagedata, 0, 0);
    }


}
/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    ray_casting(context);
}