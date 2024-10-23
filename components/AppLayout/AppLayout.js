import { useState, useRef, useEffect } from 'react'; // Import useState, useRef, and useEffect
import { useUser } from '@auth0/nextjs-auth0/client';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import PostsContext from '../../context/postsContext';
import { Logo } from '../Logo';

export const AppLayout = ({
  children,
  availableTokens,
  posts: postsFromSSR,
  postId,
  postCreated,
  users,
}) => {
  const { user } = useUser();
  const { setPostsFromSSR, posts, getPosts, noMorePosts } = useContext(PostsContext);
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar visibility
  const sidebarRef = useRef(null); // Ref for the sidebar

  useEffect(() => {
    setPostsFromSSR(postsFromSSR);
    if (postId) {
      const exists = postsFromSSR.find((post) => post._id === postId);
      if (!exists) {
        getPosts({ getNewerPosts: true, lastPostDate: postCreated });
      }
    }
  }, [postsFromSSR, setPostsFromSSR, postId, postCreated, getPosts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the sidebar and toggle button
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener to listen for clicks on the document
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Remove event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef]);

  return (
    <div className="flex min-h-screen md-[100vh]">
      {/* Toggle button for small screens */}
      <div className="lg:hidden p-2 absolute top-3 left-2 flex">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center"
        >
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-[#3c6d79]"></span>
            <span className="block w-5 h-0.5 bg-[#3c6d79]"></span>
            <span className="block w-5 h-0.5 bg-[#3c6d79]"></span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#E0E2EE]">{children}</div>

      {/* Sidebar */}
      <div
        ref={sidebarRef} // Reference the sidebar for outside click detection
        className={`flex flex-col text-white overflow-hidden fixed right-0 h-[100dvh] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="bg-[#3c6d79] px-2">
          <Logo />
          <Link href="/post/new" className="btn bg-[#f9ae65] disabled:bg-[#f9ae65]">
            New post
          </Link>
          <Link href="/token-topup" className="block mt-2 text-center">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-1"> {availableTokens} tokens available</span>
          </Link>
        </div>
        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b bg-[#3c6d79]">
          <br />
          {posts?.map((post, i) => (
            <Link
              key={post._id}
              href={`/post/${post._id}`}
              className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/20 backdrop-blur-md cursor-pointer rounded-sm ${
                postId === post._id ? 'bg-white/20 border-white' : ''
              }`}
            >
              {post.topic}
              {i}
            </Link>
          ))}
          {!noMorePosts && (
            <div
              onClick={() => {
                getPosts({ lastPostDate: posts[posts.length - 1].created });
              }}
              className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
            >
              Load more posts
            </div>
          )}
        </div>
        <div className="bg-[#3c6d79] flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
          {!!user ? (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={user.picture}
                  alt={user.name}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{user.email}</div>
                <Link className="text-sm" href="/api/auth/logout">
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href="/api/auth/login">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
};
