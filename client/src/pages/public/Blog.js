import { apiGetBlogs } from "apis/blog";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import path from "ultils/path";

const Blog = () => {
  const [blogs, setBlogs] = useState();
  const fetchBlogs = async () => {
    const response = await apiGetBlogs({ limit: 8 });
    if (response.success) setBlogs(response.blogs);
  };
  useEffect(() => {
    fetchBlogs();
  }, []);
  return (
    <>
      <div className="w-main mx-auto my-6">
        <div className="lg:grid w-screen lg:w-full pr-6 lg:grid-cols-4 gap-4">
          {blogs?.map((el) => (
            <div key={el.id} className="rounded-md border my-6">
              <img
                src={el.image}
                alt=""
                className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
              />
              <div className="p-3">
                <Link
                  to={`/${path.BLOGS}/${el.id}/${el.title}`}
                  className="text-main hover:underline line-clamp-2 cursor-pointer"
                >
                  {el.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
